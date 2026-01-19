import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { SalesChart } from "./components/SalesChart";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

async function getFinancialData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Cookie accessor in Server Component
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    const whereBranch = branchId ? { branchId: branchId } : {};

    // Sales Today
    const salesToday = await prisma.sale.aggregate({
        _sum: { total: true },
        where: {
            createdAt: { gte: today },
            ...whereBranch
        }
    });

    // Sales Month
    const salesMonth = await prisma.sale.aggregate({
        _sum: { total: true },
        where: {
            createdAt: { gte: firstDayOfMonth },
            ...whereBranch
        }
    });

    // Count Sales Today
    const countToday = await prisma.sale.count({
        where: {
            createdAt: { gte: today },
            ...whereBranch
        }
    });

    // Bills Due
    const billsDueToday = await prisma.bill.aggregate({
        _sum: { amount: true },
        where: {
            status: 'PENDENTE',
            dueDate: {
                gte: today,
                lte: endOfToday
            },
            ...whereBranch
        }
    });

    const billsDueWeek = await prisma.bill.aggregate({
        _sum: { amount: true },
        where: {
            status: 'PENDENTE',
            dueDate: {
                gte: startOfWeek,
                lte: endOfWeek
            },
            ...whereBranch
        }
    });

    // Monthly Sales Chart Data (Last 6 Months)
    const endChartDate = new Date();
    const startChartDate = subMonths(new Date(), 5); // Last 6 months including current

    const monthlySales = await prisma.sale.findMany({
        where: {
            createdAt: { gte: startOfMonth(startChartDate) },
            ...whereBranch
        },
        select: {
            createdAt: true,
            total: true
        }
    });

    // Process data for chart
    const allMonths = eachMonthOfInterval({
        start: startOfMonth(startChartDate),
        end: endChartDate
    });

    const chartData = allMonths.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const salesInMonth = monthlySales.filter(sale =>
            sale.createdAt >= monthStart && sale.createdAt <= monthEnd
        );

        const total = salesInMonth.reduce((acc, sale) => acc + Number(sale.total), 0);

        return {
            name: format(month, 'MMM', { locale: ptBR }).toUpperCase(), // JAN, FEV
            total: total
        };
    });


    return {
        totalToday: Number(salesToday._sum.total || 0),
        totalMonth: Number(salesMonth._sum.total || 0),
        countToday,
        billsDueToday: Number(billsDueToday._sum.amount || 0),
        billsDueWeek: Number(billsDueWeek._sum.amount || 0),
        chartData,
        isGlobal: !branchId // flag for UI to show "Global" label if needed
    };
}

export default async function DashboardPage() {
    const data = await getFinancialData();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Visão Geral</h1>
                <p className="text-sm text-slate-500">Fluxo de caixa e movimentações recentes.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-rose-100 shadow-sm h-28 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendas Hoje</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-900">R$ {data.totalToday.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">{data.countToday} vendas realizadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm h-28 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendas Mês</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-900">R$ {data.totalMonth.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">Acumulado mensal</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm h-28 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket Médio (Dia)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-900">
                            R$ {data.countToday > 0 ? (data.totalToday / data.countToday).toFixed(2) : "0.00"}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Por venda hoje</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-rose-100 shadow-sm h-28 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contas a Pagar</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-slate-900">
                            R$ {data.billsDueToday.toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Hoje • Semana: R$ {data.billsDueWeek.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Chart */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div className="col-span-1 md:col-span-7">
                    <SalesChart data={data.chartData} />
                </div>
            </div>

            {/* Future: Recent Transactions Table */}
            <div className="pt-4">
                {/* Existing content placeholders can go here if needed */}
            </div>
        </div>
    );
}
