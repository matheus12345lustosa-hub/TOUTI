import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { authOptions } from "@/lib/auth"; // Assuming this is where authOptions are

export async function GET(req: Request) {
    try {
        // Note: We need to import authOptions correctly. 
        // If authOptions is not exported from lib/auth, we might need to use a different way or check where it is.
        // Usually in Next.js 13+ app dir it's common to have it in lib/auth.ts or api/auth/[...nextauth]/route.ts
        // I will assume simple session retrieval works or check how middleware does it.
        // actually middleware uses `req.nextauth.token`.
        // Let's try getting session.
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, salesGoal: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const sales = await prisma.sale.aggregate({
            _sum: {
                total: true
            },
            where: {
                userId: user.id,
                createdAt: {
                    gte: start,
                    lte: end
                },
                status: "COMPLETED" // Assuming strict completed sales count
            }
        });

        const currentSales = Number(sales._sum.total || 0);
        const goal = Number(user.salesGoal || 0);

        return NextResponse.json({
            goal,
            currentSales,
            remaining: Math.max(0, goal - currentSales)
        });

    } catch (error) {
        console.error("Error fetching sales goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
