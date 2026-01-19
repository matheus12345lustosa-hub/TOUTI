import { PosScreen } from "@/modules/sales/components/PosScreen";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PosPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login?callbackUrl=/pos");
    }

    return (
        <main className="min-h-screen bg-pink-50">
            <PosScreen />
        </main>
    );
}
