import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Database,
    Settings,
    LogOut,
    PlusCircle
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/search', label: 'Relatórios', icon: <FileText size={20} /> },
        { path: '/upload', label: 'Fontes de Dados', icon: <Database size={20} /> },
    ];

    return (
        <aside className="sidebar-container">
            {/* Brand Section */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
                        <PlusCircle size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-primary leading-tight font-heading">BI System</h1>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Data Analytics</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 mt-6">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                <span className={isActive ? 'text-primary-600' : 'text-text-muted'}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link to="#" className="nav-link">
                        <Settings size={20} className="text-text-muted" />
                        Configurações
                    </Link>
                </nav>
            </div>

            {/* User Section (at bottom) */}
            <div className="p-4 border-t border-border-light bg-slate-50/50">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border-light shadow-sm mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">Adriano Silva</p>
                        <p className="text-[10px] text-text-muted">Administrador</p>
                    </div>
                </div>
                <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all">
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
