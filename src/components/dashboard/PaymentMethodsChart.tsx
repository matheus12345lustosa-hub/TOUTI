"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function PaymentMethodsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-500">Sem dados</div>;

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-sm">
                                    <span className="font-bold text-slate-100">
                                        {payload[0].name}: R$ {Number(payload[0].value).toFixed(2)}
                                    </span>
                                </div>
                            )
                        }
                        return null;
                    }}
                />
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    )
}
