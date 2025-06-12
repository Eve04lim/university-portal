'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  color = 'blue',
  size = 'md',
  className = ''
}) => {
  // Color configurations
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      value: 'text-blue-600',
      change: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      value: 'text-green-600',
      change: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      value: 'text-red-600',
      change: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      value: 'text-yellow-600',
      change: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      value: 'text-purple-600',
      change: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      value: 'text-gray-600',
      change: 'text-gray-600'
    }
  };

  // Size configurations
  const sizeClasses = {
    sm: {
      card: 'p-4',
      iconContainer: 'w-8 h-8',
      icon: 'w-4 h-4',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs'
    },
    md: {
      card: 'p-4 sm:p-6',
      iconContainer: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      title: 'text-sm sm:text-base',
      value: 'text-xl sm:text-2xl lg:text-3xl',
      change: 'text-sm'
    },
    lg: {
      card: 'p-6 sm:p-8',
      iconContainer: 'w-12 h-12 sm:w-16 sm:h-16',
      icon: 'w-6 h-6 sm:w-8 sm:h-8',
      title: 'text-base sm:text-lg',
      value: 'text-2xl sm:text-3xl lg:text-4xl',
      change: 'text-base'
    }
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  // Determine change indicator
  const getChangeIndicator = () => {
    if (change === undefined) return null;

    let ChangeIcon;
    let changeColorClass;

    if (change > 0) {
      ChangeIcon = trend === 'down' ? TrendingDown : ArrowUp;
      changeColorClass = trend === 'down' ? 'text-red-600' : 'text-green-600';
    } else if (change < 0) {
      ChangeIcon = trend === 'up' ? TrendingUp : ArrowDown;
      changeColorClass = trend === 'up' ? 'text-green-600' : 'text-red-600';
    } else {
      ChangeIcon = Minus;
      changeColorClass = 'text-gray-500';
    }

    return (
      <div className={`flex items-center gap-1 ${sizes.change} ${changeColorClass}`}>
        <ChangeIcon size={14} />
        <span>
          {Math.abs(change).toFixed(1)}
          {changeLabel && ` ${changeLabel}`}
        </span>
      </div>
    );
  };

  // Format value for display
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'k';
      }
      return val.toFixed(val % 1 === 0 ? 0 : 1);
    }
    return val.toString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${sizes.card} ${className} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-600 mb-2 ${sizes.title} line-clamp-2`}>
            {title}
          </h3>
          <div className={`font-bold ${colors.value} ${sizes.value} mb-1`}>
            {formatValue(value)}
          </div>
          {getChangeIndicator()}
        </div>
        
        {icon && (
          <div className={`
            ${sizes.iconContainer} 
            ${colors.iconBg} 
            ${colors.iconText} 
            rounded-lg 
            flex 
            items-center 
            justify-center 
            flex-shrink-0
            ml-4
          `}>
            <div className={sizes.icon}>
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar for goals or targets */}
      {typeof value === 'number' && change !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                trend === 'up' ? 'bg-green-500' : 
                trend === 'down' ? 'bg-red-500' : 
                'bg-gray-400'
              }`}
              style={{ 
                width: `${Math.min(100, Math.max(0, ((value as number) / (value as number + Math.abs(change))) * 100))}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Tooltip for additional context */}
      {(changeLabel || trend) && (
        <div className="mt-2 text-xs text-gray-500">
          {trend === 'up' && '📈 上昇傾向'}
          {trend === 'down' && '📉 下降傾向'}
          {trend === 'stable' && '➡️ 安定'}
          {!trend && changeLabel && `前期比較: ${changeLabel}`}
        </div>
      )}
    </div>
  );
};

export default StatCard;