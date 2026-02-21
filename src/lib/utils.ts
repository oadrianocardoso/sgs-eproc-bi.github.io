/**
 * Sanitizes ticket HTML content by removing tags that trigger external requests
 * or broken resources (like <img> tags with local paths).
 */
export const sanitizeTicketHtml = (html: string | null): string => {
    if (!html) return '';

    // Remove <img> tags entirely as they point to internal TJSP systems that require auth
    // and cause 404/401 errors in the console.
    let sanitized = html.replace(/<img[^>]*>/gi, '<span class="text-[10px] italic text-text-muted">[Imagem Removida para Segurança/Privacidade]</span>');

    // Also remove iframes or scripts if any (extra security)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>/gi, '');

    return sanitized;
};
