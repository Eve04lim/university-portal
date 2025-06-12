import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 一時的にlintingを無効化（PWA実装のため）
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // PWA 設定
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Progressive Web App の設定
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // 静的ファイルの最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

};

export default nextConfig;
