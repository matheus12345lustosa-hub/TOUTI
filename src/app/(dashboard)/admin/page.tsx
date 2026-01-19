import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { PaymentMethodsChart } from "@/components/dashboard/PaymentMethodsChart";
import { DollarSign, Package, AlertTriangle, CreditCard, ShoppingBag } from "lucide-react";

// For server component data fetching, we can re-use the logic or fetch via API if client-side.
// Since this is a Server Component, let's call the logic directly or fetch via absolute URL if strictly needed,
// but better to keep logic here or in a lib/service to avoid HTTP overhead on same server.
// HOWEVER, I previously created an API route. To be efficient in Server Component, I should probably import the logic function
// or just re-implement the prisma calls here cleanly (since it's server-side).
// Let's do direct Prisma here for speed and type safety, mirroring the API I designed.

import prisma from "@/lib/prisma";
import { startOfDay, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

async function getDashboardData() {
    const today = startOfDay(new Date());
    const last7DaysDate = subDays(today, 6);

    // 1. Basic Counts
    const salesCount = await prisma.sale.count();
    const productsCount = await prisma.product.count();

    // Low Stock
    const allProducts = await prisma.product.findMany({ select: { stock: true, minStock: true } });
    const lowStockCount = allProducts.filter(p => p.stock <= p.minStock).length;

    // Revenue
    const aggregator = await prisma.sale.aggregate({ _sum: { total: true } });
    const totalRevenue = Number(aggregator._sum.total || 0);

    // 2. Revenue Trend
    const salesLast7Days = await prisma.sale.findMany({
        where: { createdAt: { gte: last7DaysDate } },
        select: { createdAt: true, total: true }
    });

    const revenueByDayMap = new Map();
    for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        revenueByDayMap.set(dateStr, 0);
    }
    salesLast7Days.forEach(sale => {
        const dateStr = format(sale.createdAt, 'yyyy-MM-dd');
        if (revenueByDayMap.has(dateStr)) {
            revenueByDayMap.set(dateStr, revenueByDayMap.get(dateStr) + Number(sale.total));
        }
    });
    const revenueTrend = Array.from(revenueByDayMap.entries())
        .map(([date, value]) => ({
            date,
            formattedDate: format(new Date(date + 'T00:00:00'), 'dd/MM', { locale: ptBR }),
            value
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Payment Methods
    const payments = await prisma.salePayment.groupBy({
        by: ['method'],
        _sum: { amount: true }
    });
    const paymentMethods = payments.map(p => ({
        name: p.method === 'CREDIT_CARD' ? 'Crédito' : p.method === 'DEBIT_CARD' ? 'Débito' : p.method === 'CASH' ? 'Dinheiro' : p.method,
        value: Number(p._sum.amount || 0)
    }));

    // 4. Top Products
    const topProductsRaw = await prisma.product.findMany({
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: { name: true, salesCount: true }
    });
    const topProducts = topProductsRaw.map(p => ({ name: p.name, value: p.salesCount }));

    return {
        summary: { salesCount, productsCount, lowStockCount, totalRevenue },
        revenueTrend,
        paymentMethods,
        topProducts
    };
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const data = await getDashboardData();
    const { summary } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400">Visão geral do seu negócio em tempo real.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">R$ {summary.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-emerald-500 mt-1 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            Acumulado
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Vendas Realizadas</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.salesCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Transações concluídas</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Produtos Cadastrados</CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary.productsCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Itens no catálogo</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Estoque Baixo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{summary.lowStockCount}</div>
                        <p className="text-xs text-orange-400/80 mt-1">Produtos precisando de reposição</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">

                {/* Revenue Trend (Area Chart) - Takes up 4 columns */}
                <Card className="col-span-1 lg:col-span-4 bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Tendência de Receita</CardTitle>
                        <CardDescription className="text-slate-400">Faturamento dos últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <OverviewChart data={data.revenueTrend} />
                    </CardContent>
                </Card>

                {/* Top Products (Bar Chart) - Takes up 3 columns */}
                <Card className="col-span-1 lg:col-span-3 bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Mais Vendidos</CardTitle>
                        <CardDescription className="text-slate-400">Top 5 produtos por quantidade</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopProductsChart data={data.topProducts} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Payment Methods (Pie Chart) */}
                <Card className="col-span-1 bg-slate-900 border-slate-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Formas de Pagamento</CardTitle>
                        <CardDescription className="text-slate-400">Distribuição da receita</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentMethodsChart data={data.paymentMethods} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
