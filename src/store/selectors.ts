import { useMemo } from 'react';
import { useAppStore } from './useAppStore';

// 履修科目セレクター
export const useFilteredSubjects = () => {
  const subjects = useAppStore((state) => state.subjects);
  const filters = useAppStore((state) => state.filters.subjects);

  return useMemo(() => {
    return subjects.filter((subject) => {
      if (filters.status !== 'all' && subject.status !== filters.status) return false;
      if (filters.category !== 'all' && subject.category !== filters.category) return false;
      if (filters.search && !subject.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !subject.code.toLowerCase().includes(filters.search.toLowerCase()) &&
          !subject.professor.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [subjects, filters]);
};

// お知らせセレクター
export const useFilteredNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const filters = useAppStore((state) => state.filters.notifications);

  return useMemo(() => {
    return notifications.filter((notification) => {
      if (filters.category !== 'all' && notification.category !== filters.category) return false;
      if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
      if (filters.unreadOnly && notification.read) return false;
      if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !notification.content.toLowerCase().includes(filters.search.toLowerCase()) &&
          !notification.author.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filters]);
};

// 成績セレクター
export const useFilteredGrades = () => {
  const grades = useAppStore((state) => state.grades);
  const filters = useAppStore((state) => state.filters.grades);

  return useMemo(() => {
    return grades.filter((grade) => {
      if (filters.year !== 'all' && grade.year.toString() !== filters.year) return false;
      if (filters.semester !== 'all' && grade.semester !== filters.semester) return false;
      if (filters.category !== 'all' && grade.category !== filters.category) return false;
      return true;
    });
  }, [grades, filters]);
};

// 統計セレクター
export const useGradeStatistics = () => {
  const filteredGrades = useFilteredGrades();

  return useMemo(() => {
    const completedGrades = filteredGrades.filter(g => g.grade !== '履修中');
    const totalCredits = completedGrades.reduce((sum, grade) => sum + grade.credits, 0);
    const totalGradePoints = completedGrades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0);
    const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    const averageScore = completedGrades.length > 0 
      ? completedGrades.reduce((sum, g) => sum + g.finalScore, 0) / completedGrades.length 
      : 0;

    return {
      totalCredits,
      completedSubjects: completedGrades.length,
      overallGPA,
      averageScore,
    };
  }, [filteredGrades]);
};

// 通知統計
export const useNotificationStatistics = () => {
  const notifications = useAppStore((state) => state.notifications);

  return useMemo(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    const urgentCount = notifications.filter(n => n.priority === 'urgent').length;
    const starredCount = notifications.filter(n => n.starred).length;

    return {
      unreadCount,
      urgentCount,
      starredCount,
      totalCount: notifications.length,
    };
  }, [notifications]);
};

// 時間割セレクター
export const useTodaySchedule = () => {
  const timetable = useAppStore((state) => state.timetable);

  return useMemo(() => {
    const today = new Date().getDay(); // 0: 日曜日, 1: 月曜日...
    return timetable
      .filter(item => item.dayOfWeek === today)
      .sort((a, b) => a.period - b.period);
  }, [timetable]);
};