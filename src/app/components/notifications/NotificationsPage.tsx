'use client';

import { AlertTriangle, Archive, Bell, Calendar, ChevronRight, Clock, Eye, Star, Tag, User } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Input, ResponsiveCard, ResponsiveGrid, ResponsiveModal, Select } from '../ui';

// Custom hooks
import { useNotificationActions, type Notification } from '../../../hooks/useNotificationActions';
import { useNotificationFilters } from '../../../hooks/useNotificationFilters';
import { useNotificationSearch } from '../../../hooks/useNotificationSearch';

const NotificationsPage = () => {
  // Sample notification data
  const initialNotifications: Notification[] = [
    {
      id: '1',
      title: 'レポート提出期限のお知らせ',
      content: `データベース論のレポート提出期限が近づいています。

【提出期限】2024年6月15日（土）23:59まで
【提出方法】学習管理システム（LMS）経由
【ファイル形式】PDF形式（最大10MB）

レポートの詳細要件：
1. 文字数：3,000文字以上5,000文字以内
2. 構成：序論、本論、結論の3部構成
3. 参考文献：最低5つの学術論文を引用
4. 図表：適切な図表を含めること

遅れての提出は減点対象となりますので、余裕を持って提出してください。
質問がある場合は、担当教員またはTA（ティーチングアシスタント）までお問い合わせください。

【問い合わせ先】
田中教授: tanaka@university.ac.jp
TA: ta-database@university.ac.jp`,
      summary: 'データベース論のレポート提出期限は6月15日23:59までです',
      category: 'レポート',
      priority: 'urgent',
      author: '田中教授',
      department: '情報科学科',
      createdAt: new Date('2024-06-10T10:00:00'),
      expiresAt: new Date('2024-06-15T23:59:59'),
      read: false,
      starred: true,
      attachments: ['レポート要件.pdf', '参考資料.docx'],
      tags: ['データベース論', 'レポート', '期限'],
      targetAudience: ['3年生', '情報科学科']
    },
    {
      id: '2',
      title: '5月24日の統計学休講について',
      content: `統計学（佐藤教授担当）の休講についてお知らせします。

【休講日時】2024年5月24日（金）2時限目（10:40-12:10）
【理由】学会出張のため
【補講予定】2024年6月7日（金）5時限目（16:20-17:50）
【教室】B201（変更なし）

補講では以下の内容を予定しています：
- 第8章：仮説検定の基礎
- 第9章：t検定とχ²検定
- 演習問題とその解説

なお、次回の授業（5月31日）は予定通り実施します。
教科書の第7章「推定」を事前に読んでおいてください。

【連絡先】
佐藤教授: sato@university.ac.jp
学務課: gakumu@university.ac.jp`,
      summary: '5月24日の統計学は休講、6月7日に補講を実施します',
      category: '休講',
      priority: 'high',
      author: '佐藤教授',
      department: '数学科',
      createdAt: new Date('2024-05-20T14:00:00'),
      expiresAt: new Date('2024-06-07T18:00:00'),
      read: true,
      starred: false,
      tags: ['統計学', '休講', '補講'],
      targetAudience: ['2年生', '数学科', '情報科学科']
    },
    {
      id: '3',
      title: 'プログラミング演習の新しい課題が公開されました',
      content: `プログラミング演習の課題3を公開しました。

【課題名】Webアプリケーション開発（基礎編）
【提出期限】2024年6月20日（木）23:59
【使用言語】Java（Spring Boot）
【開発環境】IntelliJ IDEA または Eclipse

課題の概要：
簡単な図書管理システムを作成してください。以下の機能を実装する必要があります：

必須機能：
1. 図書の登録・編集・削除
2. 図書の検索（タイトル、著者名）
3. 図書の一覧表示
4. データベース連携（H2データベース使用）

追加機能（加点対象）：
1. 図書の貸出・返却機能
2. ユーザー管理機能
3. レスポンシブデザイン
4. 単体テストの実装

提出物：
- ソースコード（ZIP形式）
- 実行手順書（README.md）
- 画面キャプチャ（動作確認用）

詳細な仕様書とサンプルコードは学習管理システムからダウンロードできます。`,
      summary: 'プログラミング演習の課題3（Webアプリ開発）が公開されました',
      category: '一般',
      priority: 'normal',
      author: '山田教授',
      department: '情報科学科',
      createdAt: new Date('2024-05-22T09:00:00'),
      read: false,
      starred: false,
      attachments: ['課題3仕様書.pdf', 'サンプルコード.zip'],
      tags: ['プログラミング演習', '課題', 'Java', 'Web開発'],
      targetAudience: ['2年生', '情報科学科']
    },
    {
      id: '4',
      title: 'システムメンテナンスのお知らせ',
      content: `学習管理システム（LMS）の定期メンテナンスを実施します。

【メンテナンス日時】
2024年6月1日（土）午前2:00 ～ 午前6:00（予定）

【影響範囲】
- 学習管理システム（LMS）全体
- オンライン授業配信システム
- 学生ポータルサイト
- 図書館オンラインサービス

【メンテナンス内容】
- サーバーのセキュリティアップデート
- データベースの最適化
- 新機能の追加準備
- バックアップシステムの点検

メンテナンス中は上記サービスをご利用いただけません。
課題の提出期限がメンテナンス時間と重なる場合は、事前に提出を完了してください。

万が一、予定時間を超過する場合は、大学公式サイトでお知らせします。

【問い合わせ先】
情報システム課: it-support@university.ac.jp
緊急時連絡先: 03-1234-5678`,
      summary: '6月1日午前2:00-6:00にシステムメンテナンスを実施します',
      category: 'システム',
      priority: 'high',
      author: '情報システム課',
      department: '大学本部',
      createdAt: new Date('2024-05-25T16:00:00'),
      read: true,
      starred: false,
      tags: ['システム', 'メンテナンス', 'LMS'],
      targetAudience: ['全学生', '教職員']
    },
    {
      id: '5',
      title: '2024年度前期期末試験について',
      content: `前期期末試験に関する重要なお知らせです。

【試験期間】
2024年7月22日（月）～ 7月30日（火）

【試験時間割】
詳細な時間割は6月30日に発表予定です。
学生ポータルサイトで確認してください。

【受験上の注意】
1. 学生証を必ず持参してください
2. 試験開始20分後の入室は認められません
3. 試験終了30分前まで退室禁止
4. 携帯電話の電源は完全に切ってください
5. 不正行為は厳罰に処されます

【持ち込み可能物】
科目により異なります。詳細は各科目のシラバスを確認してください。

【追試験について】
病気・忌引き等やむを得ない理由で欠席した場合のみ、
証明書類を添えて学務課に申請してください。

【成績発表】
8月15日（木）予定

不明な点がありましたら、学務課までお問い合わせください。`,
      summary: '前期期末試験は7月22日-30日に実施します',
      category: '重要',
      priority: 'high',
      author: '学務課',
      department: '大学本部',
      createdAt: new Date('2024-05-28T11:00:00'),
      read: false,
      starred: true,
      tags: ['期末試験', '重要', '成績'],
      targetAudience: ['全学生']
    },
    {
      id: '6',
      title: '学園祭実行委員募集のお知らせ',
      content: `2024年度学園祭「青春祭」の実行委員を募集します！

【学園祭開催日】
2024年10月26日（土）・27日（日）

【募集期間】
2024年6月1日（土）～ 6月30日（日）

【募集部門】
- 企画部：イベントの企画・運営
- 広報部：宣伝・SNS運営
- 装飾部：会場装飾・デザイン
- 物販部：グッズ企画・販売
- 総務部：全体調整・事務作業

【活動期間】
7月～11月（週1-2回の会議、準備期間は週3-4回）

【応募条件】
- 本学の学部生・大学院生
- 責任感を持って最後まで活動できる方
- チームワークを大切にできる方

【応募方法】
学生ポータルサイトの応募フォームから申し込み

【説明会】
6月10日（月）18:00～ 大講堂
参加自由・事前申込不要

昨年は2万人を超える来場者で大盛況でした！
一緒に素晴らしい学園祭を作り上げましょう！

【問い合わせ】
学生課: gakusei@university.ac.jp
学園祭実行委員会: seishun-fes@university.ac.jp`,
      summary: '学園祭「青春祭」の実行委員を6月30日まで募集中です',
      category: 'イベント',
      priority: 'normal',
      author: '学生課',
      department: '学生支援部',
      createdAt: new Date('2024-05-30T13:00:00'),
      read: true,
      starred: false,
      tags: ['学園祭', '実行委員', '募集'],
      targetAudience: ['全学生']
    }
  ];

  // Custom hooks
  const notificationManager = useNotificationActions(initialNotifications);
  const notificationFilters = useNotificationFilters();
  const notificationSearch = useNotificationSearch();
  
  // Local modal state
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Apply filters and search to notifications
  const filteredByFilters = notificationFilters.applyFilters(notificationManager.notifications);
  const filteredNotifications = notificationSearch.isSearching 
    ? notificationSearch.quickSearch(filteredByFilters, notificationSearch.searchQuery)
    : filteredByFilters;

  // Get statistics
  const { unreadCount, urgentCount, starredCount } = notificationManager.statistics;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    notificationManager.handleNotificationClick(notification);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">お知らせ</h1>
        <p className="text-gray-600 text-sm sm:text-base">大学からの重要な情報をお知らせします</p>
      </div>

      {/* 統計情報 */}
      <ResponsiveGrid cols={{ default: 3 }} gap={4}>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">未読</h3>
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{unreadCount}</div>
            </div>
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">緊急</h3>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{urgentCount}</div>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
          </div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">お気に入り</h3>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{starredCount}</div>
            </div>
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* フィルター */}
      <ResponsiveCard className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="タイトル、内容、投稿者で検索..."
              value={notificationSearch.searchQuery}
              onChange={(e) => notificationSearch.setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={notificationFilters.filters.selectedCategory}
              onChange={(e) => notificationFilters.setCategory(e.target.value)}
              options={notificationFilters.categoryOptions}
            />
            <Select
              value={notificationFilters.filters.selectedPriority}
              onChange={(e) => notificationFilters.setPriority(e.target.value)}
              options={notificationFilters.priorityOptions}
            />
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg touch-target">
              <input
                type="checkbox"
                checked={notificationFilters.filters.showUnreadOnly}
                onChange={(e) => notificationFilters.setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">未読のみ</span>
            </label>
          </div>
        </div>
      </ResponsiveCard>

      {/* お知らせリスト */}
      <div className="space-y-3 sm:space-y-4">
        {filteredNotifications.map((notification) => (
          <ResponsiveCard
            key={notification.id}
            hover
            clickable
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 sm:p-6 border-l-4 ${
              notification.read ? 'border-gray-200' : 'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {notificationManager.getPriorityIcon(notification.priority)}
                  <h3 className={`text-base sm:text-lg font-semibold line-clamp-1 ${notification.read ? 'text-gray-900' : 'text-gray-900 font-bold'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${notificationManager.getCategoryColor(notification.category)}`}>
                    {notification.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${notificationManager.getPriorityColor(notification.priority)}`}>
                    {notification.priority === 'urgent' && '緊急'}
                    {notification.priority === 'high' && '高'}
                    {notification.priority === 'normal' && '普通'}
                    {notification.priority === 'low' && '低'}
                  </span>
                  {notification.expiresAt && new Date() < notification.expiresAt && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-50 text-yellow-600 border border-yellow-200">
                      期限あり
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{notification.summary}</p>
                <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {notification.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {notificationManager.formatRelativeTime(notification.createdAt)}
                  </span>
                  {notification.attachments && notification.attachments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      添付 {notification.attachments.length}件
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    notificationManager.toggleStar(notification.id);
                  }}
                  className={`p-1 rounded-full transition-colors touch-target ${
                    notification.starred 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Star size={16} className={notification.starred ? 'fill-current' : ''} />
                </button>
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notificationManager.markAsRead(notification.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded-full transition-colors touch-target"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">お知らせが見つかりません</h3>
          <p className="text-gray-600">検索条件を変更してみてください。</p>
        </div>
      )}

      {/* お知らせ詳細モーダル */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="お知らせ詳細"
        size="xl"
      >
        {selectedNotification && (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {notificationManager.getPriorityIcon(selectedNotification.priority)}
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{selectedNotification.title}</h3>
                <span className={`px-2 py-1 text-sm font-medium rounded ${notificationManager.getCategoryColor(selectedNotification.category)}`}>
                  {selectedNotification.category}
                </span>
                <span className={`px-2 py-1 text-sm font-medium rounded border ${notificationManager.getPriorityColor(selectedNotification.priority)}`}>
                  {selectedNotification.priority === 'urgent' && '緊急'}
                  {selectedNotification.priority === 'high' && '高'}
                  {selectedNotification.priority === 'normal' && '普通'}
                  {selectedNotification.priority === 'low' && '低'}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {selectedNotification.author} ({selectedNotification.department})
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(selectedNotification.createdAt)}
                </span>
                {selectedNotification.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    期限: {formatDate(selectedNotification.expiresAt)}
                  </span>
                )}
              </div>

              {selectedNotification.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedNotification.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
                {selectedNotification.content}
              </div>
            </div>

            {selectedNotification.attachments && selectedNotification.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">添付ファイル</h4>
                <div className="space-y-2">
                  {selectedNotification.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <Tag size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{attachment}</div>
                        <div className="text-xs text-gray-500">PDFファイル</div>
                      </div>
                      <Button size="sm" variant="primary">
                        ダウンロード
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">対象者</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNotification.targetAudience.map((audience, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {audience}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  notificationManager.toggleStar(selectedNotification.id);
                }}
                variant={selectedNotification.starred ? "primary" : "secondary"}
                className="flex-1"
              >
                <Star size={16} className={`mr-2 ${selectedNotification.starred ? 'fill-current' : ''}`} />
                {selectedNotification.starred ? 'お気に入り解除' : 'お気に入り'}
              </Button>
              <Button variant="primary" className="flex-1">
                <Archive size={16} className="mr-2" />
                アーカイブ
              </Button>
              <Button variant="secondary" className="flex-1">
                印刷
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default NotificationsPage;