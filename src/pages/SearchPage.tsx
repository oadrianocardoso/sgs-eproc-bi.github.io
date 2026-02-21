import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search as SearchIcon, Download, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

interface Chamado {
    id: string;
    hora_criacao: string;
    solicitado_para: string;
    grupo_responsavel: string;
    descricao: string;
    solucao: string;
    status: string;
    total_count?: number;
}

const SearchPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<Chamado[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const pageSize = 12;

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState<'both' | 'descricao' | 'solucao'>('both');
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [hasSolution, setHasSolution] = useState<boolean | null>(null);

    // Metadata for filters
    const [metadata, setMetadata] = useState<{ status: string[], groups: string[] }>({
        status: [],
        groups: []
    });

    useEffect(() => {
        fetchMetadata();
        executeSearch();
    }, [page]);

    const fetchMetadata = async () => {
        const { data: statusData } = await supabase.from('chamados').select('status').not('status', 'is', null);
        const { data: groupData } = await supabase.from('chamados').select('grupo_responsavel').not('grupo_responsavel', 'is', null);

        if (statusData && groupData) {
            const uniqueStatus = Array.from(new Set(statusData.map(i => i.status))).sort();
            const uniqueGroups = Array.from(new Set(groupData.map(i => i.grupo_responsavel))).sort();
            setMetadata({ status: uniqueStatus, groups: uniqueGroups });
        }
    };

    const executeSearch = async () => {
        setLoading(true);
        try {
            const { data: response, error } = await supabase.rpc('search_chamados', {
                search_query: searchQuery || '',
                search_field: searchField,
                status_filter: selectedStatus.length > 0 ? selectedStatus : null,
                grupo_filter: selectedGroups.length > 0 ? selectedGroups : null,
                has_solution: hasSolution === null ? 'todos' : (hasSolution ? 'com' : 'sem'),
                page_number: page + 1, // RPC expects 1-based paging
                page_size: pageSize,
                date_from: null,
                date_to: null
            });

            if (error) throw error;

            if (response && response.data) {
                setResults(response.data);
                setTotalCount(response.total || 0);
            } else {
                setResults([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error('Erro na pesquisa:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSearchField('both');
        setSelectedStatus([]);
        setSelectedGroups([]);
        setHasSolution(null);
        setPage(0);
        executeSearch();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start min-w-0 pb-12 animate-premium-in">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-80 glass-card p-8 sticky top-8 flex-shrink-0 animate-fade-scale">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-primary-500" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Filtros</h2>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-[9px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest cursor-pointer"
                    >
                        Limpar
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Busca Textual</label>
                        <div className="relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Termo..."
                                className="input pl-10 h-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                            />
                        </div>

                        <div className="flex gap-1.5 p-1 bg-slate-50/50 rounded-xl border border-slate-100">
                            {(['both', 'descricao', 'solucao'] as const).map((field) => (
                                <button
                                    key={field}
                                    onClick={() => setSearchField(field)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${searchField === field
                                        ? 'bg-white text-primary-600 shadow-sm border border-slate-100'
                                        : 'text-text-muted hover:text-text-secondary'
                                        }`}
                                >
                                    {field === 'both' ? 'Todos' : field}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {metadata.status.map((status) => (
                                <label key={status} className="flex items-center gap-3 group cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedStatus.includes(status)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedStatus([...selectedStatus, status]);
                                            else setSelectedStatus(selectedStatus.filter(s => s !== status));
                                        }}
                                    />
                                    <div className={`w-4 h-4 rounded-md border-2 flex-shrink-0 transition-all flex items-center justify-center ${selectedStatus.includes(status)
                                        ? 'bg-primary-500 border-primary-500 shadow-md shadow-primary-200'
                                        : 'bg-white border-slate-200 group-hover:border-primary-300'
                                        }`}>
                                        {selectedStatus.includes(status) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-tight truncate ${selectedStatus.includes(status) ? 'text-text-primary' : 'text-text-secondary group-hover:text-primary-500'
                                        }`}>{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full h-11 shadow-primary-200"
                        onClick={() => { setPage(0); executeSearch(); }}
                    >
                        <SearchIcon size={16} />
                        <span className="font-black text-[11px] uppercase tracking-widest">Aplicar Filtros</span>
                    </button>
                </div>
            </aside>

            {/* Results Container */}
            <div className="flex-1 space-y-6 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="badge badge-success px-4 py-2 shadow-sm italic font-mono uppercase tracking-widest">
                        {loading ? 'Pesquisando...' : `${totalCount.toLocaleString()} RegistrosEncontrados`}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-outline btn-sm h-10 border-slate-200 bg-white text-text-secondary hover:text-primary-500 cursor-pointer">
                            <Download size={14} /> <span className="uppercase font-black text-[9px] tracking-widest">Export</span>
                        </button>
                        <button className="btn btn-outline btn-sm h-10 border-slate-200 bg-white text-text-secondary hover:text-primary-500 cursor-pointer" onClick={executeSearch}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="glass-card overflow-hidden shadow-xl shadow-slate-200/20">
                    <div className="table-container border-none rounded-none">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="font-mono">TICKET</th>
                                    <th>DATA</th>
                                    <th>SOLICITANTE</th>
                                    <th>GRUPO</th>
                                    <th>STATUS</th>
                                    <th>RESUMO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(pageSize)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="animate-pulse py-6"><div className="h-3 bg-slate-100 rounded-full w-full"></div></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : results.length > 0 ? (
                                    results.map((ticket) => (
                                        <tr key={ticket.id} className="group transition-colors hover:bg-slate-50/50">
                                            <td className="font-mono font-black text-primary-500 text-[11px]">#{ticket.id}</td>
                                            <td className="text-[10px] font-bold text-text-secondary uppercase">{ticket.hora_criacao ? new Date(ticket.hora_criacao).toLocaleDateString() : '-'}</td>
                                            <td className="text-[11px] font-black text-text-primary uppercase tracking-tight truncate max-w-[120px]">{ticket.solicitado_para}</td>
                                            <td className="text-[10px] font-bold text-text-muted uppercase truncate max-w-[120px]">{ticket.grupo_responsavel}</td>
                                            <td><StatusBadge status={ticket.status} /></td>
                                            <td className="max-w-[250px] py-4 pr-6">
                                                <p className="text-[11px] font-medium text-text-secondary line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.descricao || '' }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-40">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <SearchIcon size={48} />
                                                <p className="font-black text-[10px] uppercase tracking-[0.3em]">Nada encontrado</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && totalCount > pageSize && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <button
                            className="btn btn-outline btn-sm bg-white shadow-sm border-slate-200 disabled:opacity-30"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-6 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            Page <span className="font-mono text-primary-500 text-xs">{page + 1}</span> of <span className="font-mono text-xs">{Math.ceil(totalCount / pageSize)}</span>
                        </div>
                        <button
                            className="btn btn-outline btn-sm bg-white shadow-sm border-slate-200 disabled:opacity-30"
                            disabled={(page + 1) * pageSize >= totalCount}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
