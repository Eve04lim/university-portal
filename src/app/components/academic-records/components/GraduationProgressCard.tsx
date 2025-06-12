'use client';

import React from 'react';
import { 
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button } from '../../ui';
import { AcademicRecord, CourseRegistration } from '../../../../lib/types';

interface GraduationProgressCardProps {
  academicRecord: AcademicRecord;
  registrations: CourseRegistration[];
}

const GraduationProgressCard: React.FC<GraduationProgressCardProps> = ({ 
  academicRecord, 
  registrations 
}) => {
  const getRequirementStatus = (category: string, required: number) => {
    const earned = academicRecord.courseGrades
      .filter(g => g.category === category)
      .reduce((sum, g) => sum + g.credits, 0);
    
    const inProgress = registrations
      .filter(r => r.status === 'registered' && r.category === category)
      .reduce((sum, r) => sum + r.credits, 0);
    
    const total = earned + inProgress;
    const progress = Math.min((earned / required) * 100, 100);
    const projectedProgress = Math.min((total / required) * 100, 100);
    
    return {
      earned,
      inProgress,
      required,
      remaining: Math.max(required - total, 0),
      progress,
      projectedProgress,
      isCompleted: earned >= required,
      isOnTrack: total >= required
    };
  };

  const getGraduationStatus = () => {
    if (!academicRecord.graduationRequirements) return null;
    
    const { totalCreditsRequired } = academicRecord.graduationRequirements;
    const totalEarned = academicRecord.totalCreditsEarned;
    const totalInProgress = registrations
      .filter(r => r.status === 'registered')
      .reduce((sum, r) => sum + r.credits, 0);
    
    const totalProjected = totalEarned + totalInProgress;
    const progress = Math.min((totalEarned / totalCreditsRequired) * 100, 100);
    const projectedProgress = Math.min((totalProjected / totalCreditsRequired) * 100, 100);
    
    return {
      earned: totalEarned,
      inProgress: totalInProgress,
      required: totalCreditsRequired,
      remaining: Math.max(totalCreditsRequired - totalProjected, 0),
      progress,
      projectedProgress,
      isCompleted: totalEarned >= totalCreditsRequired,
      isOnTrack: totalProjected >= totalCreditsRequired
    };
  };

  const estimateGraduationDate = () => {
    const graduationStatus = getGraduationStatus();
    if (!graduationStatus || graduationStatus.isCompleted) return null;
    
    // 簡単な推定：残り単位数を年間平均取得単位数で割る
    const averageCreditsPerYear = 30; // 仮定
    const yearsRemaining = Math.ceil(graduationStatus.remaining / averageCreditsPerYear);
    const currentYear = new Date().getFullYear();
    
    return currentYear + yearsRemaining;
  };

  const graduationStatus = getGraduationStatus();
  const estimatedGraduation = estimateGraduationDate();

  if (!academicRecord.graduationRequirements) {
    return (
      <ResponsiveCard className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">卒業要件データがありません</h3>
        <p className="text-gray-600">
          卒業要件の設定が必要です
        </p>
      </ResponsiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* 全体進捗 */}
      <ResponsiveCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">卒業要件進捗</h3>
          {graduationStatus?.isCompleted ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">卒業要件達成</span>
            </div>
          ) : graduationStatus?.isOnTrack ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Target size={20} />
              <span className="text-sm font-medium">予定通り</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock size={20} />
              <span className="text-sm font-medium">要注意</span>
            </div>
          )}
        </div>

        {graduationStatus && (
          <div className="space-y-4">
            {/* 進捗バー */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>総単位数進捗</span>
                <span>{graduationStatus.earned} / {graduationStatus.required} 単位</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="relative h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${graduationStatus.progress}%` }}
                  />
                  {graduationStatus.inProgress > 0 && (
                    <div 
                      className="absolute top-0 h-full bg-blue-300 transition-all duration-300"
                      style={{ 
                        left: `${graduationStatus.progress}%`,
                        width: `${graduationStatus.projectedProgress - graduationStatus.progress}%` 
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>取得済み: {graduationStatus.progress.toFixed(0)}%</span>
                {graduationStatus.inProgress > 0 && (
                  <span>履修中含む: {graduationStatus.projectedProgress.toFixed(0)}%</span>
                )}
                {graduationStatus.remaining > 0 && (
                  <span>残り: {graduationStatus.remaining}単位</span>
                )}
              </div>
            </div>

            {/* 統計 */}
            <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {graduationStatus.earned}
                </div>
                <div className="text-sm text-gray-600">取得済み</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {graduationStatus.inProgress}
                </div>
                <div className="text-sm text-gray-600">履修中</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {graduationStatus.remaining}
                </div>
                <div className="text-sm text-gray-600">不足分</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {estimatedGraduation || '完了'}
                </div>
                <div className="text-sm text-gray-600">予定卒業年</div>
              </div>
            </ResponsiveGrid>
          </div>
        )}
      </ResponsiveCard>

      {/* カテゴリ別要件 */}
      <ResponsiveCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">科目カテゴリ別要件</h3>
        <div className="space-y-4">
          {academicRecord.graduationRequirements.categoryRequirements.map((req, index) => {
            const status = getRequirementStatus(req.category, req.creditsRequired);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{req.category}</span>
                    {status.isCompleted ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : status.isOnTrack ? (
                      <Target className="text-blue-500" size={16} />
                    ) : (
                      <AlertCircle className="text-orange-500" size={16} />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.earned}
                    {status.inProgress > 0 && (
                      <span className="text-blue-600"> (+{status.inProgress})</span>
                    )}
                    {' / '}{status.required} 単位
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="relative h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        status.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${status.progress}%` }}
                    />
                    {status.inProgress > 0 && !status.isCompleted && (
                      <div 
                        className="absolute top-0 h-full bg-blue-300 transition-all duration-300"
                        style={{ 
                          left: `${status.progress}%`,
                          width: `${Math.min(status.projectedProgress - status.progress, 100 - status.progress)}%` 
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{status.progress.toFixed(0)}% 完了</span>
                  {status.remaining > 0 && (
                    <span>残り {status.remaining} 単位</span>
                  )}
                </div>
                
                {req.description && (
                  <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </ResponsiveCard>

      {/* 推奨事項 */}
      <ResponsiveCard className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">推奨事項</h3>
        <div className="space-y-2 text-sm text-yellow-800">
          {graduationStatus && graduationStatus.remaining > 0 && (
            <p>• 卒業まで残り {graduationStatus.remaining} 単位必要です</p>
          )}
          
          {academicRecord.graduationRequirements.categoryRequirements
            .map(req => getRequirementStatus(req.category, req.creditsRequired))
            .filter(status => !status.isOnTrack)
            .map((status, index) => (
              <p key={index}>
                • {academicRecord.graduationRequirements!.categoryRequirements[index].category}の単位が不足しています
                （残り{status.remaining}単位）
              </p>
            ))
          }
          
          {academicRecord.overallGPA < 2.0 && (
            <p>• 累積GPAが2.0を下回っています。成績向上に努めてください</p>
          )}
          
          {estimatedGraduation && estimatedGraduation > new Date().getFullYear() + 4 && (
            <p>• 現在のペースでは卒業予定年が遅れる可能性があります</p>
          )}
        </div>
      </ResponsiveCard>
    </div>
  );
};

export default GraduationProgressCard;