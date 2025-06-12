'use client';

import React, { useState } from 'react';
import { X, Download, Smartphone, Monitor, Zap } from 'lucide-react';
import { usePWA } from '../../../hooks/usePWA';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onDismiss }) => {
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isInstallable) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        onDismiss?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">University Portal</h2>
              <p className="text-blue-100">アプリをインストール</p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              より便利にご利用いただけます
            </h3>
            <p className="text-gray-600 text-sm">
              アプリをインストールして、いつでもどこでも大学ポータルにアクセス
            </p>
          </div>

          {/* 特徴 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">高速アクセス</h4>
                <p className="text-sm text-gray-600">ホーム画面から直接起動できます</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Monitor className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">オフライン対応</h4>
                <p className="text-sm text-gray-600">ネット接続がなくても一部機能が利用可能</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">プッシュ通知</h4>
                <p className="text-sm text-gray-600">重要なお知らせを即座に受信</p>
              </div>
            </div>
          </div>

          {/* 詳細情報トグル */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-blue-600 text-sm font-medium mb-4 hover:text-blue-700 transition-colors"
          >
            {showDetails ? '詳細を隠す' : 'インストール方法を見る'}
          </button>

          {/* 詳細情報 */}
          {showDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">インストール手順</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  「インストール」ボタンをタップ
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  確認ダイアログで「インストール」を選択
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  ホーム画面にアイコンが追加されます
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 アプリはホーム画面から削除でき、デバイスの容量もほとんど使用しません
                </p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              後で
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  インストール中...
                </>
              ) : (
                <>
                  <Download size={16} />
                  インストール
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;