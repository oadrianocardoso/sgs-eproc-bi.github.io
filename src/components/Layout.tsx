import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, Globe, ChevronRight } from 'lucide-react';

const Layout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar passes its own fixed positioning */}
            <Sidebar />

            <main className="flex-1 ml-80 p-8 min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 text-sm font-bold text-text-muted">
                        <span className="hover:text-primary-500 cursor-pointer transition-colors">Sistema</span>
                        <ChevronRight size={14} />
                        <span className="text-text-primary uppercase tracking-widest text-[10px] font-black">Oráculo BI</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Busca global..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all w-64 shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            <button className="p-2 text-text-secondary hover:text-primary-500 transition-colors cursor-pointer rounded-xl hover:bg-slate-50 relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
                            </button>
                            <div className="w-px h-6 bg-slate-100"></div>
                            <button className="p-2 text-text-secondary hover:text-primary-500 transition-colors cursor-pointer rounded-xl hover:bg-slate-50">
                                <Globe size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto">
                    <Outlet />
                </div>

                {/* Footer */}
                <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black text-text-muted tracking-widest uppercase">
                    <p>© 2026 SGS — Todos os direitos reservados</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary-500 transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Documentação API</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
