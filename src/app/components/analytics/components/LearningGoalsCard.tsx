'use client';

import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { LearningGoal } from '../types';
import { ResponsiveModal, Button } from '../../ui';

interface LearningGoalsCardProps {
  goals: LearningGoal[];
  onAddGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<LearningGoal>) => void;
  onDeleteGoal: (id: string) => void;
  className?: string;
}

const LearningGoalsCard: React.FC<LearningGoalsCardProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
    category: 'gpa' as LearningGoal['category']
  });

  const categoryLabels = {
    gpa: 'GPA',
    study_hours: '学習時間',
    attendance: '出席率',
    skills: 'スキル',
    credits: '単位'
  };

  const statusLabels = {
    active: '進行中',
    completed: '完了',
    paused: '一時停止',
    failed: '未達成'
  };

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };

  const handleOpenModal = (goal?: LearningGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        deadline: goal.deadline.toISOString().split('T')[0],
        category: goal.category
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        deadline: '',
        category: 'gpa'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      title: formData.title,
      description: formData.description,
      targetValue: formData.targetValue,
      currentValue: formData.currentValue,
      unit: formData.unit,
      deadline: new Date(formData.deadline),
      category: formData.category,
      status: 'active' as const
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      onAddGoal(goalData);
    }

    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const calculateProgress = (goal: LearningGoal): number => {
    return Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100));
  };

  const getDaysUntilDeadline = (deadline: Date): number => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getGoalIcon = (category: LearningGoal['category']) => {
    switch (category) {
      case 'gpa': return <TrendingUp size={16} />;
      case 'study_hours': return <Calendar size={16} />;
      case 'attendance': return <CheckCircle size={16} />;
      case 'skills': return <Target size={16} />;
      case 'credits': return <TrendingUp size={16} />;
      default: return <Target size={16} />;
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">学習目標</h3>
            <p className="text-sm text-gray-600 mt-1">
              {activeGoals.length}個の目標が進行中
            </p>
          </div>
          <Button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus size={16} />
            目標追加
          </Button>
        </div>

        {/* Active Goals */}
        <div className="space-y-4 mb-6">
          {activeGoals.map(goal => {
            const progress = calculateProgress(goal);
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            const isUrgent = daysLeft <= 7 && daysLeft > 0;
            const isOverdue = daysLeft < 0;

            return (
              <div 
                key={goal.id} 
                className={`p-4 border rounded-lg ${
                  isOverdue ? 'border-red-200 bg-red-50' : 
                  isUrgent ? 'border-yellow-200 bg-yellow-50' : 
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isOverdue ? 'bg-red-100 text-red-600' :
                      isUrgent ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getGoalIcon(goal.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{goal.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {categoryLabels[goal.category]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {goal.deadline.toLocaleDateString('ja-JP')}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle size={12} />
                            期限超過
                          </span>
                        )}
                        {isUrgent && !isOverdue && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle size={12} />
                            あと{daysLeft}日
                          </span>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">進捗</span>
                          <span className="font-medium">
                            {goal.currentValue}{goal.unit} / {goal.targetValue}{goal.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress >= 100 ? 'bg-green-500' :
                              progress >= 75 ? 'bg-blue-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.toFixed(1)}% 完了
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(goal)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[goal.status]}`}>
                    {statusLabels[goal.status]}
                  </span>
                  
                  {progress >= 100 && goal.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateGoal(goal.id, { status: 'completed' })}
                      className="text-xs"
                    >
                      完了にする
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Goals Summary */}
        {completedGoals.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              完了した目標 ({completedGoals.length}件)
            </h4>
            <div className="space-y-2">
              {completedGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-center gap-3 text-sm">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 flex-1 line-clamp-1">{goal.title}</span>
                  <span className="text-gray-500 text-xs">
                    {goal.deadline.toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
              {completedGoals.length > 3 && (
                <div className="text-xs text-gray-500 pl-6">
                  他 {completedGoals.length - 3} 件...
                </div>
              )}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">学習目標を設定しましょう</h3>
            <p className="text-sm text-gray-600 mb-4">
              明確な目標設定で学習効果を最大化できます
            </p>
            <Button onClick={() => handleOpenModal()}>
              最初の目標を作成
            </Button>
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? '目標を編集' : '新しい目標を作成'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目標名
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 今学期のGPA 3.5達成"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="目標の詳細を入力してください"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as LearningGoal['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期限
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目標値
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在値
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                単位
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 点, 時間, %"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingGoal ? '更新' : '作成'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </>
  );
};

export default LearningGoalsCard;