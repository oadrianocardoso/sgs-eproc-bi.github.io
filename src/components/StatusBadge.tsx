import React from 'react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('resolvido') || s.includes('fechado') || s.includes('concluido')) {
            return { className: 'badge-success', label: status || 'Concluído' };
        }
        if (s.includes('andamento') || s.includes('curso')) {
            return { className: 'badge-info', label: status || 'Em Atendimento' };
        }
        if (s.includes('pendente') || s.includes('aguardando')) {
            return { className: 'badge-warning', label: status || 'Pendente' };
        }
        if (s.includes('cancelado') || s.includes('erro')) {
            return { className: 'badge-danger', label: status || 'Cancelado' };
        }
        return { className: 'badge-primary', label: status || 'Aberto' };
    };

    const config = getStatusConfig(status);

    return (
        <span className={`badge ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
