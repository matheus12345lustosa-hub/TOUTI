"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import Link from "next/link";

interface NewUserFormProps {
    initialData?: any;
}

export default function NewUserForm({ initialData }: NewUserFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!initialData;

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const url = isEditing ? `/api/users/${initialData.id}` : '/api/users';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Falha ao salvar");
            }

            router.push('/dashboard/team');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-lg bg-white p-6 rounded-lg border border-rose-100 shadow-sm">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-600">Nome Completo</Label>
                    <Input id="name" name="name" defaultValue={initialData?.name} required className="bg-white border-rose-200 text-slate-900 focus-visible:ring-rose-200" placeholder="Ex: João da Silva" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-600">Email (Login)</Label>
                    <Input id="email" name="email" type="email" defaultValue={initialData?.email} required className="bg-white border-rose-200 text-slate-900 focus-visible:ring-rose-200" placeholder="usuario@touti.com" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-600">Senha {isEditing && "(Deixe em branco para manter)"}</Label>
                    <Input id="password" name="password" type="password" required={!isEditing} className="bg-white border-rose-200 text-slate-900 focus-visible:ring-rose-200" placeholder={isEditing ? "(Sem alteração)" : "******"} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-600">Nível de Acesso</Label>
                    <Select name="role" defaultValue={initialData?.role || "FUNCIONARIO"}>
                        <SelectTrigger className="bg-white border-rose-200 text-slate-900 focus:ring-rose-200">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-rose-100 text-slate-800">
                            <SelectItem value="FUNCIONARIO" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Funcionário (PDV)</SelectItem>
                            <SelectItem value="GERENTE" className="hover:bg-rose-50 focus:bg-rose-50 cursor-pointer">Gerente (Acesso Total)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="salesGoal" className="text-slate-600">Meta de Vendas (R$)</Label>
                    <Input
                        id="salesGoal"
                        name="salesGoal"
                        type="number"
                        step="0.01"
                        defaultValue={initialData?.salesGoal}
                        className="bg-white border-rose-200 text-slate-900 focus-visible:ring-rose-200"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Link href="/dashboard/team" className="w-full">
                    <Button type="button" variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        Cancelar
                    </Button>
                </Link>
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? "Salvar Alterações" : "Criar Usuário"}
                </Button>
            </div>
        </form>
    );
}
