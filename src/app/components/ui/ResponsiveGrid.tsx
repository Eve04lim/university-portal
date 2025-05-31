'use client';

import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 4,
  className = ''
}: ResponsiveGridProps) => {
  const getGridCols = () => {
    const { default: defaultCols = 1, sm = defaultCols, md = sm, lg = md, xl = lg } = cols;
    
    return `
      grid-cols-${defaultCols} 
      sm:grid-cols-${sm} 
      md:grid-cols-${md} 
      lg:grid-cols-${lg} 
      xl:grid-cols-${xl}
    `;
  };

  return (
    <div className={`grid ${getGridCols()} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;