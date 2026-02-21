import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
    showProgress?: boolean;
    progressValue?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, subtitle, loading, showProgress, progressValue }) => {
    const isPositive = trend && trend > 0;

    if (loading) {
        return (
            <div className="bento-card p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-24 h-4 bg-slate-100 rounded"></div>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="w-20 h-8 bg-slate-100 rounded-lg mb-2"></div>
                <div className="w-full h-3 bg-slate-100 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bento-card group flex flex-col justify-between h-full animate-fade-in relative overflow-hidden">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</h3>
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                        {icon}
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-text-primary tracking-tight font-heading">{value}</span>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                            {isPositive ? '+' : ''}{trend}%
                            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                    )}
                </div>

                {subtitle && (
                    <p className="text-[11px] text-text-muted font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            {showProgress && progressValue !== undefined && (
                <div className="mt-6">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPICard;
