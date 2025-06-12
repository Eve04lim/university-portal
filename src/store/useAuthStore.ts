import { Student } from '@/lib/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  student: Student | null;
  loginTime: number | null;
}

interface AuthActions {
  login: (student: Student) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Student>) => void;
  checkAuthStatus: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        student: null,
        loginTime: null,

        login: (student) =>
          set({
            isAuthenticated: true,
            student,
            loginTime: Date.now(),
          }),

        logout: () =>
          set({
            isAuthenticated: false,
            student: null,
            loginTime: null,
          }),

        updateProfile: (updates) =>
          set((state) => ({
            student: state.student ? { ...state.student, ...updates } : null,
          })),

        checkAuthStatus: () => {
          const { isAuthenticated, loginTime } = get();
          const sessionExpiry = 24 * 60 * 60 * 1000; // 24時間
          
          if (isAuthenticated && loginTime) {
            const isExpired = Date.now() - loginTime > sessionExpiry;
            if (isExpired) {
              get().logout();
              return false;
            }
            return true;
          }
          return false;
        },
      }),
      {
        name: 'auth-store',
      }
    ),
    {
      name: 'auth-store',
    }
  )
);