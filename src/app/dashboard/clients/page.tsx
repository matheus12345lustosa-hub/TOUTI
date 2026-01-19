import Link from "next/link";
import { Search, Plus, User, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams?.q || "";

    const clients = await prisma.client.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { cpf: { contains: query } },
                { email: { contains: query } }
            ]
        },
        include: {
            _count: { select: { sales: true } }
        },
        orderBy: { name: 'asc' },
        take: 50
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
                        <p className="text-xs text-slate-500">Gerencie sua base de clientes.</p>
                    </div>
                </div>
                {/* Future: Add Client Button */}
            </div>

            <div className="bg-white border border-rose-100 rounded-lg p-3 shadow-sm">
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar por nome, CPF ou email..."
                            className="pl-8 bg-rose-50/50 border-rose-200 text-slate-800 h-8 text-xs focus-visible:ring-rose-200 placeholder:text-slate-400"
                            defaultValue={query}
                        />
                    </div>
                </div>

                <div className="rounded-md border border-rose-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-rose-50/50">
                            <TableRow className="hover:bg-transparent border-rose-100 h-8">
                                <TableHead className="text-slate-500 font-semibold text-xs h-8">Nome</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-xs h-8">Contato</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-center text-xs h-8">Vendas</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-right text-xs h-8">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-16 text-center text-slate-500 text-xs">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-rose-50/30 border-rose-100 h-10 transition-colors">
                                        <TableCell className="font-medium text-slate-700 text-xs py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                    <User className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{client.name}</div>
                                                    {client.cpf && <div className="text-[10px] text-slate-400">CPF: {client.cpf}</div>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs py-2">
                                            <div>{client.phone || "-"}</div>
                                            <div className="text-[10px]">{client.email}</div>
                                        </TableCell>
                                        <TableCell className="text-center text-slate-700 text-xs py-2">
                                            {client._count.sales}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <Link href={`/dashboard/clients/${client.id}`}>
                                                <Button variant="ghost" size="sm" className="h-6 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                                    Detalhes
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
