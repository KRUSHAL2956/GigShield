import React from 'react';

export default function Card({ children, className = '', interactive = false, ...props }) {
  const baseClasses = 'bg-surface-raised border border-border rounded-[var(--radius)] shadow-soft transition-all duration-300';
  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-card hover:-translate-y-[2px]' : '';
  
  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
