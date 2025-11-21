'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

interface ChartProps {
    data: any[];
}

export const InventoryChart = ({ data }: ChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#f3f4f6',
                        backdropFilter: 'blur(12px)'
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Current Stock" />
                <Bar dataKey="reorderPoint" fill="#ef4444" radius={[4, 4, 0, 0]} name="Reorder Point" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const DemandForecastChart = ({ data }: ChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#f3f4f6',
                        backdropFilter: 'blur(12px)'
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                    name="Predicted Demand"
                />
                <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    name="Actual Sales"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
