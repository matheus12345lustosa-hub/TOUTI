import prisma from "@/lib/prisma";
import { TeamList } from "./TeamList";

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
    // Fetch users (JSON-serializable-ish)
    // Prisma returns Date objects. Next.js 13+ Server Components -> Client Components prop passing:
    // Dates are generally allowed in recent versions, but if not, we map them.
    // Let's rely on Next.js auto-serialization or map if needed.
    // To be safe against "Event handlers" error, this wrapper MUST NOT have onClick.

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });

    // Pass simple object literals
    const serializedUsers = users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        // role, id, name, email are strings
    }));

    return <TeamList initialUsers={serializedUsers} />;
}
