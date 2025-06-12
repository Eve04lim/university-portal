'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ChartSeries, ChartDataPoint } from '../types';

interface AnalyticsChartProps {
  series: ChartSeries[];
  title: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  chartType?: 'line' | 'bar' | 'area' | 'mixed';
  xAxisTitle?: string;
  yAxisTitle?: string;
  className?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  series,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  chartType = 'line',
  xAxisTitle,
  yAxisTitle,
  className = ''
}) => {
  // console.log(`AnalyticsChart [${title}]:`, { series, chartType, height });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(450);

  // Handle responsive width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const width = containerRect.width;
        // Responsive minimum widths based on screen size
        const minWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 350 : 400;
        setContainerWidth(Math.max(minWidth, width));
      }
    };

    // Initial measurement
    updateWidth();
    
    // Set up resize observer for better performance
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback resize listener
    window.addEventListener('resize', updateWidth);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Calculate chart dimensions and scales
  const { chartData, xScale, yScale, maxY, minY } = useMemo(() => {
    const allPoints = series.flatMap(s => s.data);
    
    if (allPoints.length === 0) {
      return { chartData: [], xScale: () => 0, yScale: () => 0, maxY: 0, minY: 0 };
    }

    // Filter out invalid data points
    const validPoints = allPoints.filter(p => 
      typeof p.y === 'number' && 
      !isNaN(p.y) && 
      isFinite(p.y)
    );

    if (validPoints.length === 0) {
      return { chartData: [], xScale: () => 0, yScale: () => 0, maxY: 0, minY: 0 };
    }

    const maxY = Math.max(...validPoints.map(p => p.y));
    const minY = Math.min(...validPoints.map(p => p.y));
    const yRange = maxY - minY || 1; // Prevent division by zero
    const yPadding = yRange * 0.1;

    // For time-based data
    const isTimeData = validPoints.some(p => p.x instanceof Date);
    
    let xValues: (string | number)[];
    if (isTimeData) {
      xValues = Array.from(new Set(validPoints
        .map(p => (p.x as Date).getTime())
        .filter(time => !isNaN(time))))
        .sort((a, b) => a - b);
    } else {
      xValues = Array.from(new Set(validPoints.map(p => p.x.toString())));
    }

    const chartWidth = Math.max(250, containerWidth - 100); // Responsive width with padding
    const chartHeight = height - 80; // Account for padding

    const xScale = (value: string | number | Date): number => {
      if (isTimeData && value instanceof Date) {
        const timeValue = value.getTime();
        if (xValues.length <= 1) return chartWidth / 2; // Center single points
        const timeRange = Math.max(...xValues as number[]) - Math.min(...xValues as number[]);
        if (timeRange === 0) return chartWidth / 2;
        const position = ((timeValue - Math.min(...xValues as number[])) / timeRange) * chartWidth;
        return Math.max(0, Math.min(chartWidth, position)); // Clamp to chart bounds
      } else {
        const index = xValues.indexOf(value.toString());
        if (index === -1) return 0; // Handle missing values
        if (xValues.length <= 1) return chartWidth / 2; // Center single points
        const position = (index / Math.max(xValues.length - 1, 1)) * chartWidth;
        return Math.max(0, Math.min(chartWidth, position)); // Clamp to chart bounds
      }
    };

    const yScale = (value: number): number => {
      if (!isFinite(value) || isNaN(value)) return chartHeight; // Invalid values go to bottom
      const adjustedMaxY = maxY + yPadding;
      const adjustedMinY = minY - yPadding;
      const range = adjustedMaxY - adjustedMinY;
      if (range === 0) return chartHeight / 2; // Single value data point gets centered
      const normalizedValue = (value - adjustedMinY) / range;
      const position = chartHeight - (normalizedValue * chartHeight);
      return Math.max(0, Math.min(chartHeight, position)); // Clamp to chart bounds
    };

    return {
      chartData: validPoints,
      xScale,
      yScale,
      maxY: maxY + yPadding,
      minY: minY - yPadding
    };
  }, [series, height, containerWidth]);

  // Generate SVG path for line charts
  const generatePath = (data: ChartDataPoint[], type: 'line' | 'area' = 'line'): string => {
    if (!data || data.length === 0) return '';

    // Filter out invalid data points
    const validData = data.filter(point => 
      point && 
      typeof point.y === 'number' && 
      isFinite(point.y) && 
      !isNaN(point.y) && 
      point.x !== undefined && 
      point.x !== null
    );

    if (validData.length === 0) return '';

    const sortedData = [...validData].sort((a, b) => {
      if (a.x instanceof Date && b.x instanceof Date) {
        return a.x.getTime() - b.x.getTime();
      }
      return a.x.toString().localeCompare(b.x.toString());
    });

    if (sortedData.length === 1) {
      // Single point - just draw a circle
      const x = xScale(sortedData[0].x);
      const y = yScale(sortedData[0].y);
      return `M ${x - 2} ${y} A 2 2 0 1 1 ${x + 2} ${y} A 2 2 0 1 1 ${x - 2} ${y}`;
    }

    let path = `M ${xScale(sortedData[0].x)} ${yScale(sortedData[0].y)}`;
    
    for (let i = 1; i < sortedData.length; i++) {
      const x = xScale(sortedData[i].x);
      const y = yScale(sortedData[i].y);
      if (isFinite(x) && isFinite(y)) {
        path += ` L ${x} ${y}`;
      }
    }

    if (type === 'area' && sortedData.length > 0) {
      // Close the path to create an area
      const lastX = xScale(sortedData[sortedData.length - 1].x);
      const firstX = xScale(sortedData[0].x);
      const baselineY = yScale(minY);
      
      if (isFinite(lastX) && isFinite(firstX) && isFinite(baselineY)) {
        path += ` L ${lastX} ${baselineY}`;
        path += ` L ${firstX} ${baselineY} Z`;
      }
    }

    return path;
  };

  // Generate Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const value = minY + (maxY - minY) * (i / tickCount);
      ticks.push({
        value: Math.round(value * 100) / 100,
        y: yScale(value)
      });
    }
    return ticks;
  }, [minY, maxY, yScale]);

  // Generate X-axis ticks
  const xTicks = useMemo(() => {
    const allXValues = Array.from(new Set(chartData.map(p => p.x)));
    const maxTicks = 6;
    const step = Math.max(1, Math.floor(allXValues.length / maxTicks));
    
    return allXValues
      .filter((_, index) => index % step === 0)
      .map(value => ({
        value: value instanceof Date ? value.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) : value.toString(),
        x: xScale(value)
      }));
  }, [chartData, xScale]);

  if (!series || series.length === 0) {
    return (
      <div className={`p-6 bg-white border border-gray-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>データがありません</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className={`p-6 bg-white border border-gray-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>データがありません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showLegend && (
          <div className="flex items-center gap-4">
            {series.map((s, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: s.color || `hsl(${index * 360 / series.length}, 70%, 50%)` }}
                />
                <span className="text-sm text-gray-600">{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="relative" ref={containerRef}>
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${containerWidth} ${height}`} 
          preserveAspectRatio="xMidYMid meet" 
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid && chartData.length > 0 && (
            <g className="grid">
              {yTicks.map((tick, index) => (
                <g key={index}>
                  <line
                    x1="50"
                    y1={tick.y + 40}
                    x2={containerWidth - 30}
                    y2={tick.y + 40}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x="45"
                    y={tick.y + 45}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}
              {xTicks.map((tick, index) => (
                <g key={index}>
                  <line
                    x1={tick.x + 50}
                    y1="40"
                    x2={tick.x + 50}
                    y2={height - 40}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x={tick.x + 50}
                    y={height - 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Chart content */}
          <g transform="translate(50, 40)">
            {series.map((serie, seriesIndex) => {
              const color = serie.color || `hsl(${seriesIndex * 360 / series.length}, 70%, 50%)`;
              const seriesType = serie.type || chartType;

              if (seriesType === 'bar') {
                // Calculate dynamic bar width based on chart width and data points
                const chartArea = containerWidth - 100; // Account for margins
                const availableWidth = chartArea * 0.8; // Use 80% of available space
                const barWidth = Math.max(15, Math.min(60, availableWidth / serie.data.length - 5));
                
                return (
                  <g key={seriesIndex}>
                    {serie.data.map((point, pointIndex) => {
                      const x = xScale(point.x);
                      const y = yScale(point.y);
                      const minYPosition = yScale(minY);
                      const barHeight = Math.max(0, minYPosition - y); // Ensure positive height
                      
                      return (
                        <g key={pointIndex}>
                          <rect
                            x={x - barWidth / 2}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={color}
                            className="hover:opacity-80 transition-opacity"
                            rx="2" // Slightly rounded corners
                          />
                          <title>{`${point.label || `${point.x}: ${point.y}`}`}</title>
                        </g>
                      );
                    })}
                  </g>
                );
              } else if (seriesType === 'area') {
                return (
                  <g key={seriesIndex}>
                    <path
                      d={generatePath(serie.data, 'area')}
                      fill={color}
                      fillOpacity="0.3"
                      stroke="none"
                    />
                    <path
                      d={generatePath(serie.data, 'line')}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                    />
                    {serie.data.map((point, pointIndex) => (
                      <circle
                        key={pointIndex}
                        cx={xScale(point.x)}
                        cy={yScale(point.y)}
                        r="4"
                        fill={color}
                        className="hover:r-6 transition-all"
                      >
                        <title>{point.label || `${point.x}: ${point.y}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              } else {
                // Line chart
                return (
                  <g key={seriesIndex}>
                    <path
                      d={generatePath(serie.data, 'line')}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      className="hover:stroke-width-3 transition-all"
                    />
                    {serie.data.map((point, pointIndex) => (
                      <circle
                        key={pointIndex}
                        cx={xScale(point.x)}
                        cy={yScale(point.y)}
                        r="4"
                        fill={color}
                        className="hover:r-6 transition-all cursor-pointer"
                      >
                        <title>{point.label || `${point.x}: ${point.y}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              }
            })}
          </g>

          {/* Axis labels */}
          {yAxisTitle && (
            <text
              x="20"
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${height / 2})`}
              className="text-sm fill-gray-700 font-medium"
            >
              {yAxisTitle}
            </text>
          )}
          {xAxisTitle && (
            <text
              x={containerWidth / 2}
              y={height - 5}
              textAnchor="middle"
              className="text-sm fill-gray-700 font-medium"
            >
              {xAxisTitle}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

export default AnalyticsChart;