"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shield, User, Trash2, Pencil } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { format } from "date-fns";
import Link from "next/link";

export function TeamList({ initialUsers }: { initialUsers: any[] }) {
    // initialUsers are now objects with ISO strings for dates
    // format(new Date(user.createdAt), ... ) works fine.
    // ensure any usage of user.createdAt treats it as string or converts to Date.
    const router = useRouter();
    const [users] = useState(initialUsers);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-rose-600" />
                        Equipe
                    </h1>
                    <p className="text-slate-500">Gerencie os usuários do sistema e seus níveis de acesso.</p>
                </div>
                <Link href="/dashboard/team/new">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                    </Button>
                </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-rose-100 rounded-lg overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-rose-50/50">
                        <TableRow className="hover:bg-transparent border-rose-100">
                            <TableHead className="text-slate-500 font-semibold">Nome</TableHead>
                            <TableHead className="text-slate-500 font-semibold">Email</TableHead>
                            <TableHead className="text-slate-500 font-semibold">Cargo</TableHead>
                            <TableHead className="text-slate-500 font-semibold">Data Cadastro</TableHead>
                            <TableHead className="text-right text-slate-500 font-semibold">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-rose-50/30 border-rose-100 transition-colors">
                                <TableCell className="font-medium text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        {user.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {user.email}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'GERENTE'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    {format(new Date(user.createdAt), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-1">
                                    <Link href={`/dashboard/team/${user.id}`}>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.role === 'GERENTE'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex justify-between items-end border-t border-rose-50 pt-2 mt-2">
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                <span>Cadastro:</span>
                                <span>{format(new Date(user.createdAt), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/dashboard/team/${user.id}`}>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 text-xs px-2">
                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                        Editar
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 text-xs px-2">
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
