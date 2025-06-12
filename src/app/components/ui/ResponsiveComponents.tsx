'use client';

import { ChevronRight, X } from 'lucide-react';
import React, { useEffect } from 'react';

// ResponsiveCard コンポーネント
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const ResponsiveCard = ({ 
  children, 
  className = '', 
  hover = false, 
  clickable = false, 
  onClick 
}: ResponsiveCardProps) => {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 relative
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

// ResponsiveGrid コンポーネント
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

export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 4,
  className = ''
}: ResponsiveGridProps) => {
  const getGridClasses = () => {
    const { default: defaultCols = 1, sm = defaultCols, md = sm, lg = md, xl = lg } = cols;
    
    return [
      `grid`,
      `grid-cols-${defaultCols}`,
      sm && `sm:grid-cols-${sm}`,
      md && `md:grid-cols-${md}`,
      lg && `lg:grid-cols-${lg}`,
      xl && `xl:grid-cols-${xl}`,
      `gap-${gap}`
    ].filter(Boolean).join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};

// ResponsiveTable コンポーネント
interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: string;
  hideOnMobile?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface ResponsiveTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export const ResponsiveTable = <T extends Record<string, unknown>>({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = "データがありません" 
}: ResponsiveTableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* デスクトップ用テーブル */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モバイル用カードレイアウト */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <ResponsiveCard
            key={index}
            clickable={!!onRowClick}
            onClick={() => onRowClick?.(row)}
            hover={!!onRowClick}
            className="p-4"
          >
            <div className="space-y-2">
              {columns
                .filter(column => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600 flex-shrink-0 w-1/3">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 flex-1 text-right ml-2">
                      {column.render ? column.render(row[column.key], row) : (row[column.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
            </div>
          </ResponsiveCard>
        ))}
      </div>
    </>
  );
};

// ResponsiveModal コンポーネント
interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ResponsiveModalProps) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-7xl mx-4';
      default: return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* オーバーレイ */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* スペーサー（デスクトップ用） */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* モーダルコンテンツ */}
        <div className={`
          inline-block w-full ${getSizeClasses()} 
          transform overflow-hidden rounded-t-lg sm:rounded-lg bg-white text-left align-bottom shadow-xl transition-all
          sm:my-8 sm:align-middle
        `}>
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-target"
              aria-label="モーダルを閉じる"
            >
              <X size={20} />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// フォームコンポーネント
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const FormField = ({ label, children, error, required }: FormFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = ({ error, className = '', ...props }: InputProps) => {
  return (
    <input
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        text-base sm:text-sm
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const Select = ({ error, className = '', options, ...props }: SelectProps) => {
  return (
    <select
      className={`
        block w-full px-3 py-2 border rounded-md shadow-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        text-base sm:text-sm
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '', 
  children, 
  ...props 
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors touch-target';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[44px]'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};