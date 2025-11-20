'use client';

import { useState, useEffect } from 'react';
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

export const InventoryChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="quantity" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Current Stock" />
                <Bar dataKey="reorderPoint" fill="#ef4444" radius={[4, 4, 0, 0]} name="Reorder Point" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const DemandForecastChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                    name="Predicted Demand"
                />
                <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#64748b"
                    strokeDasharray="5 5"
                    name="Actual Sales"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
