"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";

interface SalesChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <Card className="col-span-4 bg-white border-rose-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-slate-900">Vendas Mensais</CardTitle>
                <CardDescription className="text-slate-500">
                    Acompanhamento de vendas dos últimos 12 meses.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fecdd3" />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#fff1f2' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number | undefined) => [`R$ ${(value || 0).toFixed(2)}`, 'Vendas']}
                            />
                            <Bar
                                dataKey="total"
                                fill="#db2777" // Rose-600
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
