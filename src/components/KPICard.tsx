import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, subtitle, loading }) => {
    const isPositive = trend && trend > 0;

    if (loading) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                    <div className="w-16 h-4 bg-slate-100 rounded-full"></div>
                </div>
                <div className="w-1/2 h-8 bg-slate-100 rounded-lg mb-2"></div>
                <div className="w-3/4 h-3 bg-slate-100 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 animate-premium-in group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{title}</h3>
                <p className="text-3xl font-mono font-black text-text-primary tracking-tighter leading-none">
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[10px] text-text-muted font-medium mt-2 leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Decorative gradient corner */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

export default KPICard;
