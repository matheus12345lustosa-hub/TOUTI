import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { DollarSign, Calendar, TrendingUp, TrendingDown, ArrowLeft, Receipt, CreditCard, ShoppingBag, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper for currency
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const dynamic = 'force-dynamic';

export default async function FinancialPage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Cookie & Branch Filter
    const { cookies } = require("next/headers");
    const cookieStore = cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;
    const whereBranch = branchId ? { branchId: branchId } : {};

    // 1. Revenue (Vendas - Month)
    const salesMonth = await prisma.sale.findMany({
        where: {
            createdAt: { gte: firstDayOfMonth },
            status: 'COMPLETED',
            ...whereBranch
        },
        include: { items: { include: { product: true } } }
    });

    const revenue = salesMonth.reduce((acc, sale) => acc + Number(sale.total), 0);

    // 2. COGS
    const cogs = salesMonth.reduce((acc, sale) => {
        const saleCost = sale.items.reduce((sAcc, item) => {
            return sAcc + (item.quantity * Number(item.product.costPrice || 0));
        }, 0);
        return acc + saleCost;
    }, 0);

    const grossProfit = revenue - cogs;

    // 3. Expenses (Despesas)
    const expenses = await prisma.expense.findMany({
        where: {
            date: { gte: firstDayOfMonth },
            ...whereBranch
        }
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
    const fixedExpenses = expenses.filter(e => e.type === 'FIXA').reduce((acc, exp) => acc + Number(exp.amount), 0);
    const variableExpenses = expenses.filter(e => e.type === 'VARIAVEL').reduce((acc, exp) => acc + Number(exp.amount), 0);

    const netProfit = grossProfit - totalExpenses;

    // 4. Inventory Valuation
    // If Global: Sum all stocks. If Branch: Filter by branchId.
    const allProducts = await prisma.product.findMany({
        select: {
            costPrice: true,
            productStocks: {
                where: branchId ? { branchId } : undefined,
                select: { quantity: true }
            }
        }
    });

    const inventoryValue = allProducts.reduce((acc, prod) => {
        const totalStock = prod.productStocks.reduce((sum, stock) => sum + stock.quantity, 0);
        return acc + (totalStock * Number(prod.costPrice || 0));
    }, 0);

    // 5. Open Bills (Boletos Pendentes)
    const pendingBills = await prisma.bill.findMany({
        where: {
            status: 'PENDENTE',
            ...whereBranch
        },
        orderBy: { dueDate: 'asc' },
        take: 5
    });

    // 6. Recent Sales
    const recentSales = await prisma.sale.findMany({
        orderBy: { createdAt: 'desc' },
        where: { ...whereBranch },
        take: 10,
        include: {
            user: { select: { name: true } },
            client: { select: { name: true } }
        }
    });

    // 7. Top Clients
    const topClientsRaw = await prisma.sale.groupBy({
        by: ['clientId'],
        _sum: { total: true },
        where: {
            status: 'COMPLETED',
            clientId: { not: null },
            ...whereBranch
        },
        orderBy: { _sum: { total: 'desc' } },
        take: 5
    });

    const topClients = await Promise.all(topClientsRaw.map(async (item) => {
        const client = await prisma.client.findUnique({ where: { id: item.clientId! } });
        return {
            name: client?.name || "Cliente Desconhecido",
            total: Number(item._sum.total || 0),
            salesCount: await prisma.sale.count({
                where: {
                    clientId: item.clientId!,
                    status: 'COMPLETED',
                    ...whereBranch
                }
            })
        };
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Gestão Financeira</h1>
                        <p className="text-sm text-slate-500">Visão completa de lucros, custos e despesas.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/financial/expenses">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">
                            <Receipt className="mr-2 h-4 w-4" />
                            Lançar Despesa
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-rose-100 shadow-sm flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Receita Bruta (Mês)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-emerald-600">{formatCurrency(revenue)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Custo Produtos (CMV)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-orange-500">{formatCurrency(cogs)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Lucro Líquido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(netProfit)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Margem: {revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0}%
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-500">Valor em Estoque</CardTitle>
                        <PackageIcon className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-purple-600">{formatCurrency(inventoryValue)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Expenses Breakdown */}
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 text-lg">Despesas do Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                                <span className="text-slate-600 font-medium">Fixas</span>
                                <span className="text-slate-800 font-bold">{formatCurrency(fixedExpenses)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                                <span className="text-slate-600 font-medium">Variáveis</span>
                                <span className="text-slate-800 font-bold">{formatCurrency(variableExpenses)}</span>
                            </div>
                            <div className="pt-2 border-t border-rose-100 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Total</span>
                                <span className="text-red-500 font-bold">{formatCurrency(totalExpenses)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Bills */}
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-800 text-lg">Próximos Boletos</CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-rose-100 hover:bg-transparent">
                                    <TableHead className="text-slate-500 font-semibold">Descrição</TableHead>
                                    <TableHead className="text-slate-500 font-semibold">Vencimento</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingBills.map(bill => (
                                    <TableRow key={bill.id} className="border-rose-100 hover:bg-rose-50/50">
                                        <TableCell className="text-slate-700 font-medium">{bill.description || "Conta"}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {format(new Date(bill.dueDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right text-red-500 font-bold">
                                            {formatCurrency(Number(bill.amount))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pendingBills.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-slate-400 py-4">
                                            Nenhum boleto pendente.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Sales History */}
                <Card className="bg-white border-rose-100 shadow-sm col-span-2 md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-800 text-lg">Histórico de Vendas</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-rose-100 hover:bg-transparent">
                                    <TableHead className="text-slate-500 font-semibold">Data/Hora</TableHead>
                                    <TableHead className="text-slate-500 font-semibold">Cliente</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSales.map(sale => (
                                    <TableRow key={sale.id} className="border-rose-100 hover:bg-rose-50/50">
                                        <TableCell className="text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700">{format(sale.createdAt, 'dd/MM/yyyy')}</span>
                                                <span className="text-xs text-slate-400">{format(sale.createdAt, 'HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {sale.client?.name || "Consumidor Final"}
                                        </TableCell>
                                        <TableCell className="text-right text-emerald-600 font-bold">
                                            {formatCurrency(Number(sale.total))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Clients */}
                <Card className="bg-white border-rose-100 shadow-sm col-span-2 md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-800 text-lg">Top Clientes</CardTitle>
                        <Users className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-rose-100 hover:bg-transparent">
                                    <TableHead className="text-slate-500 font-semibold">Cliente</TableHead>
                                    <TableHead className="text-center text-slate-500 font-semibold">Vendas</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Total Gasto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topClients.map((client, idx) => (
                                    <TableRow key={idx} className="border-rose-100 hover:bg-rose-50/50">
                                        <TableCell className="text-slate-700 font-medium">{client.name}</TableCell>
                                        <TableCell className="text-center text-slate-600">{client.salesCount}</TableCell>
                                        <TableCell className="text-right text-emerald-600 font-bold">
                                            {formatCurrency(client.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {topClients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-slate-400 py-4">
                                            Nenhum dado de cliente disponível.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PackageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22v-10" />
        </svg>
    )
}
