'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    Package,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    BarChart3,
    Users,
    Clock,
    CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalInventory: 12543,
        lowStockItems: 12,
        activeRoutes: 5,
        pendingAnomalies: 3,
        revenue: 452000,
        efficiency: 94.5
    });

    return (
        <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Dashboard Overview
                </h1>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    Real-time insights into your supply chain operations
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {/* Total Inventory Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'inline-flex'
                        }}>
                            <Package size={24} color="white" />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                            <ArrowUpRight size={16} style={{ marginRight: '4px' }} />
                            5.2%
                        </span>
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                        {stats.totalInventory.toLocaleString()}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Total Inventory</p>
                </div>

                {/* Active Routes Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'inline-flex'
                        }}>
                            <Truck size={24} color="white" />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                            <ArrowUpRight size={16} style={{ marginRight: '4px' }} />
                            12.5%
                        </span>
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                        {stats.activeRoutes}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Active Routes</p>
                </div>

                {/* Revenue Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'inline-flex'
                        }}>
                            <DollarSign size={24} color="white" />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                            <ArrowUpRight size={16} style={{ marginRight: '4px' }} />
                            8.1%
                        </span>
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                        ${stats.revenue.toLocaleString()}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Revenue (MTD)</p>
                </div>

                {/* Efficiency Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'inline-flex'
                        }}>
                            <Activity size={24} color="white" />
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                            <ArrowUpRight size={16} style={{ marginRight: '4px' }} />
                            2.3%
                        </span>
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                        {stats.efficiency}%
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Efficiency Score</p>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Performance Chart */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                        Performance Trends
                    </h3>
                    <div style={{
                        height: '256px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        borderRadius: '12px',
                        border: '2px dashed #d1d5db'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <BarChart3 size={48} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>Chart Visualization</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { type: 'success', message: 'Inventory updated for Warehouse A', time: '5 min ago', color: '#10b981' },
                            { type: 'warning', message: 'Low stock alert for SKU-1234', time: '15 min ago', color: '#f59e0b' },
                            { type: 'info', message: 'Route optimization completed', time: '1 hour ago', color: '#3b82f6' },
                            { type: 'success', message: 'Delivery completed - Route 5', time: '2 hours ago', color: '#10b981' }
                        ].map((activity, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                background: '#f9fafb',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: activity.color,
                                    marginTop: '6px',
                                    flexShrink: 0
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                                        {activity.message}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #fbbf24',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
            }}>
                <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                        Attention Required
                    </h3>
                    <p style={{ fontSize: '14px', color: '#78350f' }}>
                        You have {stats.pendingAnomalies} pending anomalies and {stats.lowStockItems} low stock items that need review.
                    </p>
                </div>
            </div>
        </div>
    );
}
