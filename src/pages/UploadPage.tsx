import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    RefreshCw,
    Database,
    Search
} from 'lucide-react';
import Papa from 'papaparse';
import StatusBadge from '../components/StatusBadge';

interface UploadHistory {
    id: string;
    filename: string;
    status: string;
    records_count: number;
    created_at: string;
    error_message?: string;
}

const UploadPage: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [history, setHistory] = useState<UploadHistory[]>([]);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({
        type: 'idle',
        message: ''
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('upload_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setHistory(data);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const parseBrazilianDate = (dateStr: string) => {
        if (!dateStr) return null;
        const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
        if (match) {
            const [_, day, month, year, hour, minute] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).toISOString();
        }
        return null;
    };

    const handleFileUpload = async (file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setStatus({ type: 'error', message: 'Por favor, selecione apenas arquivos CSV.' });
            return;
        }

        setUploading(true);
        setProgress(0);
        setStatus({ type: 'idle', message: '' });

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: ';',
            encoding: 'UTF-8',
            transformHeader: (header) => {
                const clean = header.trim().replace(/^[\uFEFF\u200B\u200C\u200D\u200E\u200F]+|[\uFEFF\u200B\u200C\u200D\u200E\u200F]+$/g, '').replace(/^"|"$/g, '');
                const mapping: Record<string, string> = {
                    'ID': 'id',
                    'Criação': 'hora_criacao',
                    'Criação (UTC-3)': 'hora_criacao',
                    'Status': 'status',
                    'Status (Agrupado)': 'status_agrupado',
                    'Solicitado para': 'solicitado_para',
                    'Grupo responsável': 'grupo_responsavel',
                    'Descrição': 'descricao',
                    'Solução': 'solucao'
                };
                for (const [key, val] of Object.entries(mapping)) {
                    if (clean.toLowerCase() === key.toLowerCase()) return val;
                }
                return clean.toLowerCase().replace(/\s+/g, '_');
            },
            complete: async (results) => {
                const totalRows = results.data.length;
                if (totalRows === 0) {
                    setStatus({ type: 'error', message: 'O arquivo está vazio.' });
                    setUploading(false);
                    return;
                }

                try {
                    const { data: historyRecord, error: historyError } = await supabase
                        .from('upload_history')
                        .insert({
                            filename: file.name,
                            status: 'Processando',
                            records_count: totalRows
                        })
                        .select()
                        .single();

                    if (historyError) throw historyError;

                    const uniqueDataMap = new Map();
                    results.data.forEach((row: any) => {
                        if (row.id) {
                            uniqueDataMap.set(row.id, row);
                        }
                    });

                    const uniqueProcessedData = Array.from(uniqueDataMap.values()).map((row: any) => ({
                        id: row.id,
                        hora_criacao: parseBrazilianDate(row.hora_criacao) || row.hora_criacao,
                        status: row.status,
                        status_agrupado: row.status_agrupado,
                        solicitado_para: row.solicitado_para,
                        grupo_responsavel: row.grupo_responsavel,
                        descricao: row.descricao,
                        solucao: row.solucao
                    }));

                    const chunkSize = 100;
                    const chunksCount = Math.ceil(uniqueProcessedData.length / chunkSize);

                    for (let i = 0; i < chunksCount; i++) {
                        const start = i * chunkSize;
                        const chunk = uniqueProcessedData.slice(start, start + chunkSize);

                        const { error: insertError } = await supabase
                            .from('chamados')
                            .upsert(chunk, { onConflict: 'id' });

                        if (insertError) throw insertError;

                        setProgress(Math.round(((i + 1) / chunksCount) * 100));
                        await new Promise(r => setTimeout(r, 100));
                    }

                    await supabase
                        .from('upload_history')
                        .update({ status: 'Sucesso' })
                        .eq('id', historyRecord.id);

                    setStatus({ type: 'success', message: `${uniqueProcessedData.length} registros processados com sucesso!` });
                    fetchHistory();
                } catch (err: any) {
                    console.error('Erro no upload:', err);
                    setStatus({ type: 'error', message: `Erro ao importar: ${err.message}` });
                } finally {
                    setUploading(false);
                }
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-premium-in">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase font-mono italic">Importação</h1>
                <p className="text-xs font-black text-primary-500 uppercase tracking-widest">Sincronização de Base de Dados</p>
            </div>

            <div
                className={`drop-zone p-16 flex flex-col items-center gap-8 ${dragActive ? 'active scale-102' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className={`w-24 h-24 rounded-[2rem] bg-primary-50 text-primary-500 flex items-center justify-center shadow-inner transition-transform duration-500 ${uploading ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                    <UploadCloud size={40} />
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-xl font-black text-text-primary tracking-tight">Arraste seu arquivo CSV</h2>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
                        <FileText size={14} /> Somente arquivos .csv com delimitador ";" (ponto e vírgula)
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                    <label className="btn btn-primary w-full h-12 shadow-primary-200 cursor-pointer">
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileInput} disabled={uploading} />
                        <Search size={16} />
                        <span className="font-black text-[11px] uppercase tracking-widest">Selecionar Arquivo</span>
                    </label>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40">Tamanho máximo sugerido: 50MB</p>
                </div>

                {uploading && (
                    <div className="w-full space-y-4 animate-fade-in">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div
                                className="h-full bg-primary-500 transition-all duration-300 shadow-lg shadow-primary-200"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-500">
                            <span>Processando registros...</span>
                            <span className="font-mono">{progress}%</span>
                        </div>
                    </div>
                )}
            </div>

            {status.type !== 'idle' && (
                <div className={`glass-card p-6 border-none flex items-center gap-4 animate-fade-scale ${status.type === 'success' ? 'bg-emerald-50/50 text-emerald-700' : 'bg-rose-50/50 text-rose-700'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="text-sm font-bold">{status.message}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                        <Clock size={14} className="text-primary-500" /> Histórico de Uploads
                    </h2>
                    <button onClick={fetchHistory} className="text-[9px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                        <RefreshCw size={12} /> Atualizar
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="table-container border-none rounded-none">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Arquivo</th>
                                    <th>Data</th>
                                    <th>Registros</th>
                                    <th>Status</th>
                                    <th className="text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="font-bold text-[11px] text-text-primary flex items-center gap-3">
                                                <FileText size={14} className="text-primary-400" />
                                                <span className="truncate max-w-[200px]">{item.filename}</span>
                                            </td>
                                            <td className="text-[10px] font-bold text-text-muted uppercase">
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
                                            <td className="font-mono text-[11px] font-black text-text-secondary">
                                                {item.records_count}
                                            </td>
                                            <td>
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="text-right">
                                                <button className="p-2 text-text-muted hover:text-danger cursor-pointer transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-30">
                                            Nenhum histórico disponível
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-8 py-8 opacity-40">
                    <div className="flex items-center gap-2">
                        <Database size={16} className="text-text-muted" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Conectado ao Supabase</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">SSL Seguro Ativo</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
