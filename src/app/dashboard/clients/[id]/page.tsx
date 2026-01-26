import Link from "next/link";
import { ArrowLeft, User, DollarSign, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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
import { ptBR } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
    const client = await prisma.client.findUnique({
        where: { id: params.id },
        include: {
            sales: {
                where: { status: 'COMPLETED' },
                include: { items: { include: { product: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!client) {
        return <div className="p-8 text-white">Cliente não encontrado.</div>;
    }

    // Calculate Stats
    let totalSpent = 0;
    let totalSales = 0;
    let lastPurchaseDate = null;
    let topProducts: any[] = [];

    try {
        totalSales = client.sales.length;
        if (totalSales > 0) {
            lastPurchaseDate = client.sales[0].createdAt;
            totalSpent = client.sales.reduce((acc, sale) => acc + Number(sale.total), 0);
        }

        // Calculate Top Products
        const productStats = new Map<string, { name: string; quantity: number; spent: number }>();

        client.sales.forEach(sale => {
            sale.items.forEach(item => {
                // Safety check: existing product?
                if (item.product) {
                    const current = productStats.get(item.productId) || { name: item.product.name, quantity: 0, spent: 0 };
                    current.quantity += item.quantity;
                    current.spent += Number(item.total);
                    productStats.set(item.productId, current);
                }
            });
        });

        topProducts = Array.from(productStats.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

    } catch (e) {
        console.error("Error calculating client stats:", e);
        // Fallback or just continue with zeros
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="h-6 w-6 text-rose-500" />
                        {client.name}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {client.birthday ? format(client.birthday, "dd/MM") : "Sem aniversário"} • {client.phone || "Sem telefone"} • CPF: {client.cpf || "-"}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Total Gasto</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Total de Compras</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-800">{totalSales}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Última Compra</CardTitle>
                        <Calendar className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-extrabold text-slate-800">
                            {lastPurchaseDate ? format(lastPurchaseDate, "dd/MM/yyyy") : "-"}
                        </div>
                        {lastPurchaseDate && (
                            <p className="text-xs text-slate-500">
                                {format(lastPurchaseDate, "HH:mm")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Products */}
                <Card className="bg-white border-rose-100 shadow-sm col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Produtos Mais Comprados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-rose-100 hover:bg-transparent">
                                    <TableHead className="text-slate-500 font-semibold">Produto</TableHead>
                                    <TableHead className="text-center text-slate-500 font-semibold">Qtd.</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((prod, idx) => (
                                    <TableRow key={idx} className="border-rose-100 hover:bg-rose-50/30">
                                        <TableCell className="text-slate-700 font-medium">{prod.name}</TableCell>
                                        <TableCell className="text-center text-slate-600">{prod.quantity}</TableCell>
                                        <TableCell className="text-right text-emerald-600 font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.spent)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {topProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-slate-400 py-4">
                                            Nenhum produto comprado ainda.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent History */}
                <Card className="bg-white border-rose-100 shadow-sm col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Histórico Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {client.sales.slice(0, 5).map(sale => (
                                <div key={sale.id} className="flex justify-between items-center bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                                    <div className="flex flex-col">
                                        <span className="text-slate-700 text-sm font-medium">Compra</span>
                                        <span className="text-slate-500 text-xs">
                                            {format(sale.createdAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <span className="text-emerald-600 font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.total))}
                                    </span>
                                </div>
                            ))}
                            {client.sales.length === 0 && (
                                <div className="text-center text-slate-400 text-sm py-4">
                                    Nenhuma compra registrada.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
