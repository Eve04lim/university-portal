import { useState, useCallback } from 'react';

// Notification type definition
export interface Notification {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: '重要' | '一般' | 'イベント' | 'システム' | '休講' | 'レポート';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  author: string;
  department: string;
  createdAt: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  read: boolean;
  starred: boolean;
  attachments?: string[];
  tags: string[];
  targetAudience: string[];
}

export interface NotificationStatistics {
  unreadCount: number;
  urgentCount: number;
  starredCount: number;
  totalCount: number;
  categoryStats: Record<string, number>;
  priorityStats: Record<string, number>;
}

export interface UseNotificationActionsReturn {
  // State
  notifications: Notification[];
  statistics: NotificationStatistics;
  
  // Actions
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  toggleStar: (id: string) => void;
  markAllAsRead: () => void;
  markAllAsUnread: () => void;
  deleteNotification: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkToggleStar: (ids: string[]) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  
  // Event handlers
  handleNotificationClick: (notification: Notification) => void;
  
  // Utility functions
  getCategoryColor: (category: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
  isExpired: (notification: Notification) => boolean;
  isUrgent: (notification: Notification) => boolean;
  formatRelativeTime: (date: Date) => string;
}

export const useNotificationActions = (
  initialNotifications: Notification[]
): UseNotificationActionsReturn => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Action functions
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: false } : notification
    ));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, starred: !notification.starred } : notification
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  const markAllAsUnread = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: false })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    setNotifications(prev => prev.filter(notification => !ids.includes(notification.id)));
  }, []);

  const bulkMarkAsRead = useCallback((ids: string[]) => {
    setNotifications(prev => prev.map(notification =>
      ids.includes(notification.id) ? { ...notification, read: true } : notification
    ));
  }, []);

  const bulkToggleStar = useCallback((ids: string[]) => {
    setNotifications(prev => prev.map(notification =>
      ids.includes(notification.id) ? { ...notification, starred: !notification.starred } : notification
    ));
  }, []);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id'>): string => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notificationData,
      id
    };
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    ));
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Auto-mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  // Computed statistics
  const statistics: NotificationStatistics = {
    unreadCount: notifications.filter(n => !n.read).length,
    urgentCount: notifications.filter(n => n.priority === 'urgent').length,
    starredCount: notifications.filter(n => n.starred).length,
    totalCount: notifications.length,
    categoryStats: notifications.reduce((acc, notification) => {
      acc[notification.category] = (acc[notification.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    priorityStats: notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Utility functions
  const getCategoryColor = useCallback((category: string): string => {
    switch (category) {
      case '重要': return 'text-red-600 bg-red-50';
      case 'システム': return 'text-blue-600 bg-blue-50';
      case 'イベント': return 'text-green-600 bg-green-50';
      case '休講': return 'text-orange-600 bg-orange-50';
      case 'レポート': return 'text-purple-600 bg-purple-50';
      case '一般': 
      default: return 'text-gray-600 bg-gray-50';
    }
  }, []);

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getPriorityIcon = useCallback((priority: string): React.ReactNode => {
    // Note: Icons would be imported from lucide-react in actual usage
    switch (priority) {
      case 'urgent': return '🚨'; // AlertTriangle
      case 'high': return 'ℹ️'; // Info
      case 'normal': return '🔔'; // Bell
      case 'low': return '🕐'; // Clock
      default: return '🔔'; // Bell
    }
  }, []);

  const isExpired = useCallback((notification: Notification): boolean => {
    if (!notification.expiresAt) return false;
    return new Date() > notification.expiresAt;
  }, []);

  const isUrgent = useCallback((notification: Notification): boolean => {
    return notification.priority === 'urgent' || isExpired(notification);
  }, [isExpired]);

  const formatRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return '1時間未満';
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return {
    // State
    notifications,
    statistics,
    
    // Actions
    markAsRead,
    markAsUnread,
    toggleStar,
    markAllAsRead,
    markAllAsUnread,
    deleteNotification,
    bulkDelete,
    bulkMarkAsRead,
    bulkToggleStar,
    addNotification,
    updateNotification,
    
    // Event handlers
    handleNotificationClick,
    
    // Utility functions
    getCategoryColor,
    getPriorityColor,
    getPriorityIcon,
    isExpired,
    isUrgent,
    formatRelativeTime
  };
};