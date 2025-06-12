# UI Components Library

このディレクトリには、University Portalアプリケーションで使用される再利用可能なUIコンポーネントが含まれています。

## 使用方法

### バレルエクスポートを使用したインポート

```typescript
// 推奨: バレルエクスポートを使用
import { ResponsiveCard, ResponsiveGrid, Button, Input } from '../ui';

// 非推奨: 個別ファイルからのインポート
import { ResponsiveCard } from '../ui/ResponsiveComponents';
```

## 利用可能なコンポーネント

### コアコンポーネント (ResponsiveComponents.tsx)

- **ResponsiveCard** - レスポンシブなカードコンポーネント
- **ResponsiveGrid** - レスポンシブなグリッドレイアウト
- **ResponsiveModal** - モーダルダイアログ
- **ResponsiveTable** - テーブル（モバイルでカード表示）
- **Button** - ボタンコンポーネント
- **Input** - 入力フィールド
- **Select** - セレクトボックス
- **FormField** - フォームフィールドラッパー

### スタンドアローンコンポーネント

- **ResponsiveGridStandalone** - 独立したグリッドコンポーネント
- **ResponsiveModalStandalone** - 独立したモーダルコンポーネント
- **ResponsiveTableStandalone** - 独立したテーブルコンポーネント

### 短縮エイリアス

便利な短縮名も利用可能です：

```typescript
import { Card, Grid, Modal, Table } from '../ui';
// ResponsiveCard, ResponsiveGrid, ResponsiveModal, ResponsiveTable のエイリアス
```

### 代替フォームコンポーネント

特別なフォーム機能が必要な場合：

```typescript
import { FormFieldAlt, InputAlt, SelectAlt, ButtonAlt } from '../ui';
```

## 例

### 基本的な使用例

```typescript
import { ResponsiveCard, ResponsiveGrid, Button } from '../ui';

const MyComponent = () => {
  return (
    <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={4}>
      <ResponsiveCard className="p-4">
        <h2>カードタイトル</h2>
        <p>カードの内容</p>
        <Button variant="primary">アクション</Button>
      </ResponsiveCard>
    </ResponsiveGrid>
  );
};
```

### モーダルの使用例

```typescript
import { ResponsiveModal, Button } from '../ui';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        モーダルを開く
      </Button>
      
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="モーダルタイトル"
        size="md"
      >
        <p>モーダルの内容</p>
      </ResponsiveModal>
    </>
  );
};
```

## アーキテクチャ

### ファイル構造

```
ui/
├── index.ts                    # バレルエクスポート（メインエントリポイント）
├── ResponsiveComponents.tsx    # コアUIコンポーネント
├── ResponsiveForm.tsx         # フォーム専用コンポーネント
├── ResponsiveGrid.tsx         # スタンドアローングリッド
├── ResponsiveModal.tsx        # スタンドアローンモーダル
├── ResponsiveTable.tsx        # スタンドアローンテーブル
└── README.md                  # このファイル
```

### 設計原則

1. **レスポンシブファースト** - 全コンポーネントはモバイル対応
2. **一貫性** - 統一されたプロップス設計と命名規則
3. **再利用性** - コンポーネントは独立して動作
4. **アクセシビリティ** - WAI-ARIAガイドラインに準拠
5. **型安全性** - TypeScriptによる完全な型定義

## 貢献ガイドライン

新しいUIコンポーネントを追加する場合：

1. 適切なファイルに追加（または新しいファイルを作成）
2. `index.ts` のバレルエクスポートを更新
3. TypeScript型定義を含める
4. レスポンシブデザインを実装
5. このREADMEを更新

## マイグレーション

既存のコードを新しいバレルエクスポートシステムに移行する場合：

```typescript
// 変更前
import { ResponsiveCard } from '../ui/ResponsiveComponents';
import ResponsiveModal from '../ui/ResponsiveModal';

// 変更後
import { ResponsiveCard, ResponsiveModal } from '../ui';
```