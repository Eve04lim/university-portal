'use client';

import { Award, BookOpen, Calendar, ChevronRight, Clock, FileText, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveCard, ResponsiveGrid } from '../ui';

const Dashboard = () => {
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
    { name: "履修登録", icon: BookOpen, color: "bg-blue-500", href: "/subjects" },
    { name: "成績確認", icon: Star, color: "bg-green-500", href: "/grades" },
    { name: "シラバス", icon: FileText, color: "bg-purple-500", href: "/syllabus" },
    { name: "図書館", icon: BookOpen, color: "bg-orange-500", href: "/library" },
  ];

  const stats = [
    { name: "今学期履修単位", value: "24", unit: "単位", icon: BookOpen, color: "text-blue-600", change: "+2" },
    { name: "通算GPA", value: "3.75", unit: "/4.0", icon: Award, color: "text-green-600", change: "+0.1" },
    { name: "出席率", value: "92", unit: "%", icon: TrendingUp, color: "text-purple-600", change: "+3%" },
    { name: "今日の授業", value: "4", unit: "コマ", icon: Calendar, color: "text-orange-600", change: "" },
  ];

  return (
    <div className="space-y-6">
      {/* ウェルカムセクション */}
      <ResponsiveCard className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">おかえりなさい、田中太郎さん</h1>
          <p className="text-blue-100 text-sm sm:text-base">今日の予定を確認して、充実した一日を過ごしましょう。</p>
        </div>
      </ResponsiveCard>

      {/* 統計情報 */}
      <ResponsiveGrid 
        cols={{ default: 2, md: 4 }}
        gap={4}
        className="mb-6"
      >
        {stats.map((stat, index) => (
          <ResponsiveCard key={index} className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 line-clamp-1">
                  {stat.name}
                </p>
                <div className="flex items-baseline">
                  <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 ml-1">
                    {stat.unit}
                  </p>
                </div>
                {stat.change && (
                  <p className="text-xs text-green-600 mt-1">
                    {stat.change}
                  </p>
                )}
              </div>
              <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} opacity-80`} />
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveGrid 
        cols={{ default: 1, lg: 3 }}
        gap={6}
      >
        {/* 今日のスケジュール */}
        <div className="lg:col-span-2">
          <ResponsiveCard className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="text-blue-600 mr-2 w-5 h-5" />
                <h2 className="text-lg font-semibold text-gray-900">今日のスケジュール</h2>
              </div>
              <Link 
                href="/timetable"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                時間割を見る 
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-20 sm:w-24 text-xs sm:text-sm text-gray-600 font-medium">
                    {item.time}
                  </div>
                  <div className="flex-1 ml-3 sm:ml-4 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1">
                      {item.subject}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                      {item.room} | {item.professor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        </div>

        {/* クイックリンク */}
        <div>
          <ResponsiveCard className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクセス</h2>
            <ResponsiveGrid 
              cols={{ default: 2 }}
              gap={3}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all touch-target"
                >
                  <div className={`p-2 sm:p-3 rounded-full ${link.color} text-white mb-2`}>
                    <link.icon size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 text-center line-clamp-1">
                    {link.name}
                  </span>
                </Link>
              ))}
            </ResponsiveGrid>
          </ResponsiveCard>
        </div>
      </ResponsiveGrid>

      {/* お知らせ */}
      <ResponsiveCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最新のお知らせ</h2>
          <Link 
            href="/notifications"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            すべて見る
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
              notification.urgent ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">
                    {notification.title}
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-2 line-clamp-2">
                    {notification.content}
                  </p>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                {notification.urgent && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex-shrink-0">
                    緊急
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ResponsiveCard>
    </div>
  );
};

export default Dashboard;