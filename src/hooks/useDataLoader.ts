import { DataService } from '@/services/dataService';
import { useAppStore } from '@/store/useAppStore';

export const useDataLoader = () => {
  const {
    setSubjects,
    setTimetable,
    setGrades,
    setNotifications,
    setLoading,
    isAuthenticated
  } = useAppStore();

  const loadAllData = async () => {
    if (!isAuthenticated) return;

    try {
      // 並行してデータを読み込み
      setLoading('subjects', true);
      setLoading('timetable', true);
      setLoading('grades', true);
      setLoading('notifications', true);

      const [subjects, timetable, grades, notifications] = await Promise.all([
        DataService.getSubjects(),
        DataService.getTimetable(),
        DataService.getGrades(),
        DataService.getNotifications(),
      ]);

      setSubjects(subjects);
      setTimetable(timetable);
      setGrades(grades);
      setNotifications(notifications);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading('subjects', false);
      setLoading('timetable', false);
      setLoading('grades', false);
      setLoading('notifications', false);
    }
  };

  const loadSubjects = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('subjects', true);
      const subjects = await DataService.getSubjects();
      setSubjects(subjects);
    } catch (error) {
      console.error('履修科目の読み込みに失敗しました:', error);
    } finally {
      setLoading('subjects', false);
    }
  };

  const loadTimetable = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('timetable', true);
      const timetable = await DataService.getTimetable();
      setTimetable(timetable);
    } catch (error) {
      console.error('時間割の読み込みに失敗しました:', error);
    } finally {
      setLoading('timetable', false);
    }
  };

  const loadGrades = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('grades', true);
      const grades = await DataService.getGrades();
      setGrades(grades);
    } catch (error) {
      console.error('成績の読み込みに失敗しました:', error);
    } finally {
      setLoading('grades', false);
    }
  };

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading('notifications', true);
      const notifications = await DataService.getNotifications();
      setNotifications(notifications);
    } catch (error) {
      console.error('お知らせの読み込みに失敗しました:', error);
    } finally {
      setLoading('notifications', false);
    }
  };

  return {
    loadAllData,
    loadSubjects,
    loadTimetable,
    loadGrades,
    loadNotifications,
  };
};