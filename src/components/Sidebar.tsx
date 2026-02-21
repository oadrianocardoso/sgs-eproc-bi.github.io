import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    BarChart3,
    Search,
    UploadCloud,
    Settings,
    LogOut,
    Hexagon,
    HelpCircle
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
        { path: '/search', label: 'Pesquisa', icon: <Search size={20} /> },
        { path: '/upload', label: 'Importação', icon: <UploadCloud size={20} /> },
    ];

    return (
        <aside className="floating-sidebar group">
            <div className="flex-1 flex flex-col h-full">
                {/* Brand Section */}
                <div className="flex items-center gap-3 mb-10 px-2 transition-transform duration-300 group-hover:scale-105">
                    <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <Hexagon size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-text-primary tracking-tighter uppercase font-mono">Oráculo</h1>
                        <p className="text-[10px] font-bold text-primary-500 tracking-[0.2em] uppercase leading-none">BI System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5 flex-1">
                    <p className="px-4 mb-3 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Navegação</p>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-200/50 scale-[1.02]'
                                        : 'text-text-secondary hover:bg-slate-100/80 hover:text-text-primary'
                                    }`}
                            >
                                <span className={`${isActive ? 'text-white' : 'text-primary-400 group-hover:text-primary-500'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="mt-auto space-y-4 pt-6 border-t border-slate-100/50">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            <span className="text-sm font-black text-text-secondary">AD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-text-primary truncate uppercase tracking-tight">Adriano Silva</p>
                            <p className="text-[9px] text-text-muted leading-tight font-black uppercase tracking-wider">Admin</p>
                        </div>
                        <button className="p-2 text-text-muted hover:text-danger transition-colors cursor-pointer rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100">
                            <LogOut size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center justify-center gap-2 py-2 px-3 text-[9px] font-black text-text-secondary bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-100 shadow-sm">
                            <Settings size={14} /> CONFIG
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2 px-3 text-[9px] font-black text-white bg-slate-800 hover:bg-black rounded-xl transition-all cursor-pointer shadow-md">
                            <HelpCircle size={14} /> SUPORTE
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
