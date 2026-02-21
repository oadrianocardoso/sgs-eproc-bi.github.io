import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    Calendar,
    PieChart as PieChartIcon
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import KPICard from '../components/KPICard';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const StatsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_statistics', {
                date_from: dateRange.from || null,
                date_to: dateRange.to || null
            });

            if (error) throw error;
            setStats(data);
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTrend = (total: number, prev: number) => {
        if (!prev || prev === 0) return 0;
        return Math.round(((total - prev) / prev) * 100);
    };

    return (
        <div className="space-y-10 min-w-0 pb-12">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase font-mono italic">Dashboard</h1>
                    <p className="text-xs font-black text-primary-500 uppercase tracking-widest mt-1">Visão Analítica da Operação</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                        <input
                            type="date"
                            className="text-[11px] font-bold border-none focus:ring-0 bg-transparent text-text-secondary cursor-pointer outline-none"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                        <span className="text-text-muted flex items-center font-black text-[10px] uppercase">até</span>
                        <input
                            type="date"
                            className="text-[11px] font-bold border-none focus:ring-0 bg-transparent text-text-secondary cursor-pointer outline-none"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>
                    <button className="btn btn-primary btn-sm px-6 h-10 shadow-primary-200" onClick={fetchStats}>
                        <Calendar size={14} />
                        <span className="font-black text-[10px] uppercase tracking-widest">Filtrar</span>
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <KPICard
                    title="Total de Chamados"
                    value={stats?.total_chamados || 0}
                    trend={calculateTrend(stats?.total_chamados, stats?.previous_total)}
                    icon={<Users size={24} />}
                    subtitle={`Vs. ${stats?.previous_total || 0} no período anterior`}
                    loading={loading}
                />
                <KPICard
                    title="Tempo Médio (MTTR)"
                    value={`${Math.round(stats?.avg_mttr_hours || 0)}h`}
                    trend={-5}
                    icon={<Clock size={24} />}
                    subtitle="Meta operacional: 5h 00m"
                    loading={loading}
                />
                <KPICard
                    title="Taxa de Resolução"
                    value={`${Math.round(((stats?.with_solution || 0) / (stats?.total_chamados || 1)) * 100)}%`}
                    trend={1.5}
                    icon={<CheckCircle2 size={24} />}
                    subtitle="Taxa de SLA ativa no período"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Line Chart - Volume over hour */}
                <div className="lg:col-span-2 glass-card p-8 animate-premium-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary-500" /> Volume por Hora
                            </h2>
                            <p className="text-xs font-bold text-text-secondary">Fluxo das requisições ao longo do dia</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.by_hour || []}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#c4b5fd" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }}
                                    tickFormatter={(val) => `${String(val).padStart(2, '0')}:00`}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={6}
                                    dot={false}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#7c3aed' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart - Status */}
                <div className="glass-card p-8 animate-premium-in" style={{ animationDelay: '0.2s' }}>
                    <div className="space-y-1 mb-10">
                        <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                            <PieChartIcon size={14} className="text-primary-500" /> Distribuição
                        </h2>
                        <p className="text-xs font-bold text-text-secondary">Status atualizado do banco</p>
                    </div>
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.by_status || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={8}
                                    dataKey="count"
                                >
                                    {(stats?.by_status || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-mono font-black text-text-primary tracking-tighter leading-none">{stats?.total_chamados || 0}</span>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Total</span>
                        </div>
                    </div>
                    <div className="space-y-2 mt-8">
                        {(stats?.by_status || []).slice(0, 4).map((item: any, index: number) => (
                            <div key={item.status} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-[11px] font-black text-text-secondary uppercase tracking-tight truncate max-w-[100px]">{item.status}</span>
                                </div>
                                <span className="text-xs font-mono font-black text-text-primary">
                                    {stats?.total_chamados ? Math.round((item.count / stats.total_chamados) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
