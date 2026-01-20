import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/shared/ui/button";
import NewUserForm from "../new/NewUserForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        notFound();
    }

    const serializedUser = {
        ...user,
        salesGoal: user.salesGoal ? Number(user.salesGoal) : null
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/team">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Editar Usuário
                    </h1>
                    <p className="text-slate-500">Atualize os dados e permissões do membro.</p>
                </div>
            </div>

            <NewUserForm initialData={serializedUser} />
        </div>
    );
}
