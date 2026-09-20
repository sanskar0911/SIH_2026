import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#0e1424] border border-slate-800/80 rounded-xl p-4 shadow-lg shadow-black/40 hover:border-slate-700/80 transition-colors ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold tracking-wide text-slate-100 uppercase font-mono">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
