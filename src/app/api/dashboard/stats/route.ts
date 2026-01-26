import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const today = startOfDay(new Date());
        const last7DaysDate = subDays(today, 6);
        const last30DaysDate = subDays(today, 29);

        // 1. Basic Counts
        const salesCount = await prisma.sale.count({
            where: { status: { not: 'CANCELLED' } }
        });
        const productsCount = await prisma.product.count();

        // Dynamic Low Stock (reusing logic)
        // Dynamic Low Stock (reusing logic)
        const allStocks = await prisma.productStock.findMany({ select: { quantity: true, minStock: true } });
        const lowStockCount = allStocks.filter(s => s.quantity <= s.minStock).length;

        // Total Revenue
        const aggregator = await prisma.sale.aggregate({
            _sum: { total: true },
            where: { status: { not: 'CANCELLED' } }
        });
        const totalRevenue = aggregator._sum.total || 0;

        // 2. Revenue Trend (Last 7 Days)
        const salesLast7Days = await prisma.sale.findMany({
            where: {
                createdAt: { gte: last7DaysDate },
                status: { not: 'CANCELLED' }
            },
            select: { createdAt: true, total: true }
        });

        // Group by day
        const revenueByDayMap = new Map();
        // Initialize last 7 days with 0
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


        // 3. Payment Methods Distribution
        // 3. Payment Methods Distribution
        // This is tricky with current schema as Payment is separate, let's Aggregate SalePayment
        const payments = await prisma.salePayment.groupBy({
            by: ['method'],
            _sum: { amount: true },
            where: {
                sale: { status: { not: 'CANCELLED' } }
            }
        });

        const paymentMethods = payments.map((p: any) => ({
            name: p.method,
            value: Number(p._sum.amount || 0)
        }));

        // 4. Top Products (Most Sold)
        const topProductsRaw = await prisma.product.findMany({
            orderBy: { salesCount: 'desc' } as any,
            take: 5,
            select: { name: true, salesCount: true } as any
        });

        const topProducts = topProductsRaw.map((p: any) => ({
            name: p.name,
            value: p.salesCount
        }));

        return NextResponse.json({
            summary: {
                salesCount,
                productsCount,
                lowStockCount,
                totalRevenue: Number(totalRevenue)
            },
            charts: {
                revenueTrend,
                paymentMethods,
                topProducts
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
