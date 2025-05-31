'use client';

import { Bell, BookOpen, Calendar, Home, Menu, Star, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  active?: boolean;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // 画面サイズ検出
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // モバイルメニューが開いているときの背景スクロール防止
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  const menuItems: MenuItem[] = [
    { name: "ホーム", icon: Home, href: "/" },
    { name: "時間割", icon: Calendar, href: "/timetable" },
    { name: "履修科目", icon: BookOpen, href: "/subjects" },
    { name: "成績", icon: Star, href: "/grades" },
    { name: "お知らせ", icon: Bell, href: "/notifications" },
    { name: "プロフィール", icon: User, href: "/profile" },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* モバイル用ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors touch-target"
                aria-label="メニューを開く"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link href="/" className="ml-2 text-lg sm:text-xl font-bold text-gray-900">
                大学ポータル
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/notifications"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors touch-target"
                aria-label="通知"
              >
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </Link>
              <Link
                href="/profile"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors touch-target"
                aria-label="プロフィール"
              >
                <User size={18} className="sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* デスクトップサイドバー */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
              <div className="flex flex-col flex-grow px-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon 
                          size={18} 
                          className={`mr-3 flex-shrink-0 ${
                            isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                          }`} 
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* モバイルサイドバー（オーバーレイ） */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">メニュー</span>
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 touch-target"
                    aria-label="メニューを閉じる"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className={`group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors touch-target ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon 
                          size={20} 
                          className={`mr-4 flex-shrink-0 ${
                            isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                          }`} 
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0">
          <main className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* モバイル用ボトムナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-bottom">
        <div className="grid grid-cols-4 gap-1 px-2 py-1">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 text-xs transition-colors touch-target ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} 
                />
                <span className="truncate text-[10px] sm:text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ResponsiveLayout;