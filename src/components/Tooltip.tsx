import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!text) return <>{children}</>;

    return (
        <div
            className="relative flex items-center h-full w-full overflow-hidden"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <div className="truncate w-full">
                {children}
            </div>

            {isVisible && (
                <div className="fixed z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-xl pointer-events-none max-w-lg break-words animate-in fade-in zoom-in duration-200"
                    style={{
                        transform: 'translateY(-100%)',
                        marginTop: '-8px'
                    }}
                >
                    {text}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
