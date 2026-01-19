import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/shared/ui/button";
import NewUserForm from "./NewUserForm";

export default function NewUserPage() {
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
                        Novo Usuário
                    </h1>
                    <p className="text-slate-500">Adicione um novo membro à equipe.</p>
                </div>
            </div>

            <NewUserForm />
        </div>
    );
}
