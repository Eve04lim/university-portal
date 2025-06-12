'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveCard } from '../../ui';
import { SemesterGPA } from '../../../../lib/types';

interface GPAChartProps {
  semesterGPAs: SemesterGPA[];
}

const GPAChart: React.FC<GPAChartProps> = ({ semesterGPAs }) => {
  const maxGPA = 4.0;
  const minGPA = Math.min(...semesterGPAs.map(s => s.gpa), 0);
  
  const getSemesterLabel = (semester: string, year: number) => {
    const semesterLabels: { [key: string]: string } = {
      'spring': '前期',
      'fall': '後期',
      'intensive': '集中',
      'year-long': '通年'
    };
    return `${year}${semesterLabels[semester] || semester}`;
  };

  const calculateTrend = () => {
    if (semesterGPAs.length < 2) return null;
    const recent = semesterGPAs[semesterGPAs.length - 1].gpa;
    const previous = semesterGPAs[semesterGPAs.length - 2].gpa;
    const diff = recent - previous;
    
    if (diff > 0.1) return { type: 'up', value: diff };
    if (diff < -0.1) return { type: 'down', value: Math.abs(diff) };
    return { type: 'stable', value: 0 };
  };

  const trend = calculateTrend();

  return (
    <ResponsiveCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">GPA推移</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.type === 'up' ? 'text-green-600' :
            trend.type === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend.type === 'up' && <TrendingUp size={16} />}
            {trend.type === 'down' && <TrendingDown size={16} />}
            {trend.type === 'stable' && <Minus size={16} />}
            {trend.type !== 'stable' && (
              <span>{trend.value > 0 ? '+' : ''}{trend.value.toFixed(2)}</span>
            )}
          </div>
        )}
      </div>
      
      {semesterGPAs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          表示するGPAデータがありません
        </div>
      ) : (
        <div className="space-y-4">
          {/* GPA推移グラフ */}
          <div className="relative">
            <div className="h-48 relative">
              {/* Y軸ラベル */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                <span>{maxGPA.toFixed(1)}</span>
                <span>{((maxGPA + minGPA) / 2).toFixed(1)}</span>
                <span>{minGPA.toFixed(1)}</span>
              </div>
              
              {/* グラフエリア */}
              <div className="ml-8 h-full relative">
                {/* グリッドライン */}
                <div className="absolute inset-0">
                  {[0, 25, 50, 75, 100].map(percent => (
                    <div 
                      key={percent}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${percent}%` }}
                    />
                  ))}
                </div>
                
                {/* データポイントとライン */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* ライン */}
                  {semesterGPAs.map((semester, index) => {
                    if (index === semesterGPAs.length - 1) return null;
                    
                    const x1 = (index / (semesterGPAs.length - 1)) * 100;
                    const x2 = ((index + 1) / (semesterGPAs.length - 1)) * 100;
                    const y1 = ((maxGPA - semester.gpa) / (maxGPA - minGPA)) * 100;
                    const y2 = ((maxGPA - semesterGPAs[index + 1].gpa) / (maxGPA - minGPA)) * 100;
                    
                    return (
                      <line
                        key={index}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                      />
                    );
                  })}
                  
                  {/* データポイント */}
                  {semesterGPAs.map((semester, index) => {
                    const x = semesterGPAs.length === 1 ? 50 : (index / (semesterGPAs.length - 1)) * 100;
                    const y = ((maxGPA - semester.gpa) / (maxGPA - minGPA)) * 100;
                    
                    return (
                      <g key={index}>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#3B82F6"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={`${x}%`}
                          y={`${y - 8}%`}
                          textAnchor="middle"
                          className="text-xs fill-gray-700"
                        >
                          {semester.gpa.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            
            {/* X軸ラベル */}
            <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
              {semesterGPAs.map((semester, index) => (
                <span key={index} className="transform -rotate-45 origin-top-left">
                  {getSemesterLabel(semester.semester, semester.academicYear)}
                </span>
              ))}
            </div>
          </div>

          {/* GPA統計 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {semesterGPAs.length > 0 ? 
                    (semesterGPAs.reduce((sum, s) => sum + s.gpa, 0) / semesterGPAs.length).toFixed(2) :
                    '0.00'
                  }
                </div>
                <div className="text-xs text-gray-600">平均GPA</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {semesterGPAs.length > 0 ? Math.max(...semesterGPAs.map(s => s.gpa)).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-600">最高GPA</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {semesterGPAs.length > 0 ? Math.min(...semesterGPAs.map(s => s.gpa)).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-600">最低GPA</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveCard>
  );
};

export default GPAChart;