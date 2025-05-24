'use client';

import { Bell, BookOpen, Calendar, Clock, FileText, Home, Menu, Star, User, X } from 'lucide-react';
import { useState } from 'react';

const UniversityPortal = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // サンプルデータ
  const notifications = [
    { id: 1, title: "レポート提出期限のお知らせ", content: "データベース論のレポート提出期限は明日までです", time: "2時間前", urgent: true },
    { id: 2, title: "休講情報", content: "5月24日の統計学は休講となります", time: "4時間前", urgent: false },
    { id: 3, title: "新しい課題が追加されました", content: "プログラミング演習の課題3が公開されました", time: "1日前", urgent: false },
  ];

  const todaySchedule = [
    { time: "09:00-10:30", subject: "データベース論", room: "A302", professor: "田中教授" },
    { time: "10:40-12:10", subject: "統計学", room: "B201", professor: "佐藤教授" },
    { time: "13:00-14:30", subject: "プログラミング演習", room: "PC室1", professor: "山田教授" },
    { time: "14:40-16:10", subject: "英語コミュニケーション", room: "C105", professor: "Smith教授" },
  ];

  const quickLinks = [
    { name: "履修登録", icon: BookOpen, color: "bg-blue-500" },
    { name: "成績確認", icon: Star, color: "bg-green-500" },
    { name: "シラバス", icon: FileText, color: "bg-purple-500" },
    { name: "図書館", icon: BookOpen, color: "bg-orange-500" },
  ];

  const menuItems = [
    { name: "ホーム", icon: Home, active: true },
    { name: "時間割", icon: Calendar, active: false },
    { name: "履修科目", icon: BookOpen, active: false },
    { name: "成績", icon: Star, active: false },
    { name: "お知らせ", icon: Bell, active: false },
    { name: "プロフィール", icon: User, active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-2 text-xl font-bold text-gray-900">大学ポータル</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* サイドバー */}
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full lg:w-64 bg-white rounded-lg shadow-sm p-4`}>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.name}
                </a>
              ))}
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 space-y-6">
            {/* ウェルカムセクション */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">おかえりなさい、田中太郎さん</h2>
              <p className="opacity-90">今日の予定を確認して、充実した一日を過ごしましょう。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 今日のスケジュール */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Clock className="text-blue-600 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">今日のスケジュール</h3>
                </div>
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-24 text-sm text-gray-600 font-medium">
                        {item.time}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="font-medium text-gray-900">{item.subject}</div>
                        <div className="text-sm text-gray-600">{item.room} | {item.professor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* クイックリンク */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクセス</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link) => (
                    <button
                      key={link.name}
                      className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className={`p-3 rounded-full ${link.color} text-white mb-2`}>
                        <link.icon size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{link.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* お知らせ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Bell className="text-blue-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">最新のお知らせ</h3>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                    notification.urgent ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                        <p className="text-gray-700 text-sm mb-2">{notification.content}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      {notification.urgent && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          緊急
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UniversityPortal;