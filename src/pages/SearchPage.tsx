import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search as SearchIcon, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

interface Chamado {
    id: string;
    hora_criacao: string;
    solicitado_para: string;
    grupo_responsavel: string;
    descricao: string;
    solucao: string;
    status: string;
    designado_especialista: string;
    grupo_especialistas: string;
    status_operacional: string;
    status_agrupado: string;
    hora_fechamento: string;
    comentarios: string;
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
        <div className="space-y-8 pb-12 animate-premium-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase font-mono italic">Busca Avançada</h1>
                    <p className="text-xs font-black text-primary-500 uppercase tracking-widest mt-1">Exploração Profunda de Dados</p>
                </div>
            </div>

            {/* Top Horizontal Filters */}
            <div className="glass-card p-6 border-none shadow-xl shadow-slate-200/20 animate-fade-scale">
                <div className="flex flex-col xl:flex-row items-end gap-6">
                    {/* Text Search */}
                    <div className="w-full xl:w-96 space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <SearchIcon size={12} className="text-primary-500" /> Busca Textual
                        </label>
                        <div className="relative group flex gap-2">
                            <input
                                type="text"
                                placeholder="Termo, ID ou Descrição..."
                                className="input h-10 text-[11px] font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                            />
                            <select
                                className="input h-10 w-32 px-3 text-[10px] font-black uppercase tracking-tight"
                                value={searchField}
                                onChange={(e) => setSearchField(e.target.value as any)}
                            >
                                <option value="both">TODOS</option>
                                <option value="descricao">DESCRIÇÃO</option>
                                <option value="solucao">SOLUÇÃO</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status Selecionados</label>
                            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto p-1 custom-scrollbar bg-slate-50/50 rounded-xl border border-slate-100 min-h-10">
                                {metadata.status.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            if (selectedStatus.includes(status)) setSelectedStatus(selectedStatus.filter(s => s !== status));
                                            else setSelectedStatus([...selectedStatus, status]);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${selectedStatus.includes(status)
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                                            : 'bg-white text-text-muted border-slate-100 hover:border-primary-200'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resolution Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Resolução</label>
                            <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 h-10">
                                {([null, true, false] as const).map((val) => (
                                    <button
                                        key={String(val)}
                                        onClick={() => setHasSolution(val)}
                                        className={`flex-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${hasSolution === val
                                            ? 'bg-white text-primary-600 shadow-sm border border-slate-100'
                                            : 'text-text-muted hover:text-text-secondary'
                                            }`}
                                    >
                                        {val === null ? 'Geral' : (val ? 'Com Solução' : 'Sem Solução')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-end gap-2">
                            <button
                                className="btn btn-primary flex-1 h-10 shadow-primary-200"
                                onClick={() => { setPage(0); executeSearch(); }}
                            >
                                <SearchIcon size={14} />
                                <span className="font-black text-[10px] uppercase tracking-widest">Pesquisar</span>
                            </button>
                            <button
                                onClick={clearFilters}
                                className="btn btn-outline h-10 w-10 border-slate-200 bg-white text-text-muted hover:text-rose-500"
                                title="Limpar Filtros"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

                <div className="glass-card shadow-xl shadow-slate-200/20 overflow-hidden border-none">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="table min-w-[2800px]">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="font-mono sticky left-0 bg-slate-50 z-10 py-5 pl-8">TICKET</th>
                                    <th>CRIADO EM</th>
                                    <th>SOLICITANTE</th>
                                    <th>GRUPO RESPONSÁVEL</th>
                                    <th>ESPECIALISTA</th>
                                    <th>GRUPO ESPECIALISTA</th>
                                    <th>STATUS OPERACIONAL</th>
                                    <th>STATUS FINAL</th>
                                    <th>STATUS AGRUPADO</th>
                                    <th>FECHADO EM</th>
                                    <th className="min-w-[400px]">DESCRIÇÃO</th>
                                    <th className="min-w-[400px]">SOLUÇÃO</th>
                                    <th className="min-w-[400px]">COMENTÁRIOS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(pageSize)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="sticky left-0 bg-white"><div className="h-4 bg-slate-100 rounded-full w-16 animate-pulse"></div></td>
                                            {[...Array(12)].map((_, j) => (
                                                <td key={j} className="animate-pulse py-6"><div className="h-3 bg-slate-50 rounded-full w-full"></div></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : results.length > 0 ? (
                                    results.map((ticket) => (
                                        <tr key={ticket.id} className="group transition-colors hover:bg-slate-50/20 text-[10.5px]">
                                            <td className="font-mono font-black text-primary-500 sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors pl-8">#{ticket.id}</td>
                                            <td className="font-bold text-text-secondary uppercase">{ticket.hora_criacao ? new Date(ticket.hora_criacao).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="font-black text-text-primary uppercase tracking-tight truncate max-w-[200px]">{ticket.solicitado_para}</td>
                                            <td className="font-bold text-text-muted uppercase truncate max-w-[200px]">{ticket.grupo_responsavel}</td>
                                            <td className="font-black text-primary-600 uppercase truncate max-w-[200px]">{ticket.designado_especialista || '-'}</td>
                                            <td className="font-bold text-text-muted uppercase truncate max-w-[200px]">{ticket.grupo_especialistas || '-'}</td>
                                            <td><span className="px-2 py-1 rounded bg-slate-50 text-[9px] font-black uppercase text-slate-500 whitespace-nowrap">{ticket.status_operacional}</span></td>
                                            <td><StatusBadge status={ticket.status} /></td>
                                            <td><span className="px-2 py-1 rounded bg-primary-50 text-[9px] font-black uppercase text-primary-600 whitespace-nowrap">{ticket.status_agrupado}</span></td>
                                            <td className="font-bold text-text-secondary uppercase">{ticket.hora_fechamento ? new Date(ticket.hora_fechamento).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="max-w-[400px] py-4 pr-10">
                                                <p className="font-medium text-text-secondary line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: ticket.descricao || '' }} />
                                            </td>
                                            <td className="max-w-[400px] py-4 pr-10">
                                                <p className="font-medium text-emerald-700 line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: ticket.solucao || '' }} />
                                            </td>
                                            <td className="max-w-[400px] py-4 pr-10">
                                                <p className="font-medium text-text-muted line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.comentarios || '' }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="text-center py-40">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <SearchIcon size={48} />
                                                <p className="font-black text-[10px] uppercase tracking-[0.3em]">Nenhum registro encontrado</p>
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
