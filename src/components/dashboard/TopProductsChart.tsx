"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function TopProductsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-slate-500">Sem dados</div>;

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                />
                <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-sm">
                                    <span className="text-[0.70rem] uppercase text-slate-400 block mb-1">
                                        {payload[0].payload.name}
                                    </span>
                                    <span className="font-bold text-blue-500">
                                        {payload[0].value} vendidos
                                    </span>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    )
}
