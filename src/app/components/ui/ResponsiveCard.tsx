'use client';

import { ChevronRight } from 'lucide-react';
import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const ResponsiveCard = ({ 
  children, 
  className = '', 
  hover = false, 
  clickable = false, 
  onClick 
}: ResponsiveCardProps) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 
        ${hover ? 'hover:shadow-md hover:border-gray-300' : 'shadow-sm'} 
        ${clickable ? 'cursor-pointer transition-all duration-200' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
      {clickable && (
        <div className="absolute top-4 right-4 text-gray-400">
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  );
};

export default ResponsiveCard;