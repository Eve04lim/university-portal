'use client';

import React, { useMemo, useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target, 
  Award, 
  BarChart3,
  Download,
  Brain,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button, Select } from '../ui';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { 
  prepareGradeProgressChart, 
  prepareStudyHoursChart, 
  prepareSubjectDistributionChart 
} from './utils';
import StatCard from './components/StatCard';
import AnalyticsChart from './components/AnalyticsChart';
import LearningGoalsCard from './components/LearningGoalsCard';
import { AnalyticsTimeframe } from './types';

const AnalyticsPage: React.FC = () => {
  const analytics = useAnalytics();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'goals'>('overview');

  // Note: Debug logging can be enabled here for troubleshooting
  // console.log('Analytics data:', analytics);

  const {
    summary,
    learningPattern,
    efficiencyMetrics,
    recommendations,
    currentTimeframe,
    studySessions,
    academicProgress,
    subjectPerformances,
    learningGoals,
    setTimeframe,
    addLearningGoal,
    updateLearningGoal,
    deleteLearningGoal,
    isLoading,
    refreshData,
    exportData
  } = analytics;

  // Chart data preparation
  const gradeProgressData = useMemo(() => {
    return prepareGradeProgressChart(academicProgress || []);
  }, [academicProgress]);

  const studyHoursData = useMemo(() => {
    return prepareStudyHoursChart(studySessions || [], currentTimeframe.type);
  }, [studySessions, currentTimeframe.type]);

  const subjectDistributionData = useMemo(() => {
    return prepareSubjectDistributionChart(subjectPerformances || []);
  }, [subjectPerformances]);

  // Timeframe options
  const timeframeOptions = [
    { value: 'week', label: '過去1週間' },
    { value: 'month', label: '過去1ヶ月' },
    { value: 'semester', label: '今学期' },
    { value: 'year', label: '過去1年' },
    { value: 'all', label: '全期間' }
  ];

  const viewOptions = [
    { value: 'overview', label: '概要' },
    { value: 'detailed', label: '詳細分析' },
    { value: 'goals', label: '学習目標' }
  ];

  // Learning insights
  const getTopPerformanceTime = () => {
    if (learningPattern.preferredTimeSlots.length === 0) return '情報不足';
    const bestSlot = learningPattern.preferredTimeSlots[0];
    return `${bestSlot.hour}:00頃 (効率度: ${bestSlot.efficiency.toFixed(1)})`;
  };

  const getTopLocation = () => {
    if (learningPattern.preferredLocations.length === 0) return '情報不足';
    const bestLocation = learningPattern.preferredLocations[0];
    const locationNames = {
      library: '図書館',
      classroom: '教室',
      home: '自宅',
      online: 'オンライン'
    };
    return locationNames[bestLocation.location as keyof typeof locationNames] || bestLocation.location;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">学習分析ダッシュボード</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            あなたの学習データを分析して、より効果的な学習戦略を提案します
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Select
              value={currentTimeframe.type}
              onChange={(e) => setTimeframe(e.target.value as AnalyticsTimeframe['type'])}
              options={timeframeOptions}
              className="min-w-[140px]"
            />
            <Select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as 'overview' | 'detailed' | 'goals')}
              options={viewOptions}
              className="min-w-[120px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              variant="secondary"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">更新</span>
            </Button>
            <Button
              onClick={() => exportData('json')}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <Download size={16} />
              <span className="hidden sm:inline">エクスポート</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={4}>
            <StatCard
              title="現在のGPA"
              value={summary.currentGpa.toFixed(2)}
              change={summary.gpaChange}
              changeLabel="前期比"
              icon={<TrendingUp />}
              color="blue"
              trend={summary.gpaChange > 0 ? 'up' : summary.gpaChange < 0 ? 'down' : 'stable'}
            />
            <StatCard
              title="学習時間"
              value={`${summary.totalStudyHours.toFixed(1)}h`}
              change={summary.studyHoursChange}
              changeLabel="前期比"
              icon={<Clock />}
              color="green"
              trend={summary.studyHoursChange > 0 ? 'up' : 'stable'}
            />
            <StatCard
              title="出席率"
              value={`${summary.averageAttendance.toFixed(1)}%`}
              change={summary.attendanceChange}
              changeLabel="前期比"
              icon={<BookOpen />}
              color="purple"
              trend={summary.attendanceChange > 0 ? 'up' : 'stable'}
            />
            <StatCard
              title="取得単位"
              value={`${summary.completedCredits}単位`}
              change={summary.creditsChange}
              changeLabel="今期"
              icon={<Award />}
              color="yellow"
              trend="up"
            />
          </ResponsiveGrid>

          {/* Charts Section */}
          <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
            <AnalyticsChart
              series={gradeProgressData}
              title="GPA推移"
              chartType="line"
              height={300}
              yAxisTitle="GPA"
              xAxisTitle="学期"
            />
            <AnalyticsChart
              series={studyHoursData}
              title="学習時間推移"
              chartType="bar"
              height={300}
              yAxisTitle="時間"
              xAxisTitle="日付"
            />
          </ResponsiveGrid>

          {/* Learning Insights */}
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
            <ResponsiveCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">学習パターン</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">最高効率時間:</span>
                  <p className="font-medium text-gray-900">{getTopPerformanceTime()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">最適学習場所:</span>
                  <p className="font-medium text-gray-900">{getTopLocation()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">集中スコア:</span>
                  <p className="font-medium text-gray-900">{efficiencyMetrics.focusScore}/100</p>
                </div>
              </div>
            </ResponsiveCard>

            <ResponsiveCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">強みと改善点</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">強み科目:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summary.strongestSubjects.map((subject, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">改善が必要:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summary.improvementAreas.map((subject, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ResponsiveCard>

            <ResponsiveCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">効率性メトリクス</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">効果的学習時間:</span>
                  <p className="font-medium text-gray-900">
                    {efficiencyMetrics.effectiveStudyHours.toFixed(1)}h / {efficiencyMetrics.totalStudyHours.toFixed(1)}h
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">学習継続記録:</span>
                  <p className="font-medium text-gray-900">{efficiencyMetrics.currentStreak}日連続</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">燃え尽き症候群リスク:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    efficiencyMetrics.burnoutRisk === 'low' ? 'bg-green-100 text-green-700' :
                    efficiencyMetrics.burnoutRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {efficiencyMetrics.burnoutRisk === 'low' ? '低' :
                     efficiencyMetrics.burnoutRisk === 'medium' ? '中' : '高'}
                  </span>
                </div>
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <ResponsiveCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">学習改善提案</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{rec.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>期待効果: {rec.expectedImpact}</span>
                      <span>期間: {rec.timeToComplete}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ResponsiveCard>
          )}
        </>
      )}

      {/* Detailed View */}
      {selectedView === 'detailed' && (
        <>
          <AnalyticsChart
            series={subjectDistributionData}
            title="科目別学習時間配分"
            chartType="bar"
            height={400}
            yAxisTitle="学習時間 (時間)"
            xAxisTitle="科目カテゴリ"
          />
          
          <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
            <ResponsiveCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">週間学習パターン</h3>
              <div className="space-y-3">
                {learningPattern.weeklyPattern.map((day, index) => {
                  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {dayNames[day.dayOfWeek]}
                      </span>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (day.studyHours / 8) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {day.studyHours.toFixed(1)}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </ResponsiveCard>

            <ResponsiveCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学習場所別効率</h3>
              <div className="space-y-3">
                {learningPattern.preferredLocations.map((location, index) => {
                  const locationNames = {
                    library: '図書館',
                    classroom: '教室',
                    home: '自宅',
                    online: 'オンライン'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {locationNames[location.location as keyof typeof locationNames] || location.location}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{location.frequency}回</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${(location.efficiency / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">
                          {location.efficiency.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>
        </>
      )}

      {/* Goals View */}
      {selectedView === 'goals' && (
        <LearningGoalsCard
          goals={learningGoals}
          onAddGoal={addLearningGoal}
          onUpdateGoal={updateLearningGoal}
          onDeleteGoal={deleteLearningGoal}
        />
      )}

      {/* Achievements */}
      {summary.achievements.length > 0 && (
        <ResponsiveCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">最近の実績</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ResponsiveCard>
      )}
    </div>
  );
};

export default AnalyticsPage;