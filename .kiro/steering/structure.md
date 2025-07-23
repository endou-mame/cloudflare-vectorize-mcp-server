# Project Structure

## Root Directory Organization

```
project-root/
├── .kiro/                  # Kiro spec-driven development files
│   ├── steering/          # Project steering documents
│   └── specs/             # Feature specifications
├── src/                    # Source code
├── tests/                  # Test files
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── config/                 # Configuration files
├── public/                 # Static assets (frontend)
├── .env.example           # Environment variables template
├── package.json           # Node.js dependencies (if applicable)
├── requirements.txt       # Python dependencies (if applicable)
├── docker-compose.yml     # Docker configuration (if applicable)
├── README.md              # Project documentation
└── CLAUDE.md              # Claude Code instructions
```

## Subdirectory Structures

### Source Code (`src/`)
```
src/
├── components/            # UIコンポーネント (Frontend)
│   ├── common/           # 共通コンポーネント
│   ├── features/         # 機能別コンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── pages/                # ページコンポーネント (Frontend)
├── api/                  # APIエンドポイント (Backend)
│   ├── routes/          # ルート定義
│   ├── controllers/     # コントローラー
│   ├── services/        # ビジネスロジック
│   └── middlewares/     # ミドルウェア
├── models/               # データモデル
├── utils/                # ユーティリティ関数
├── lib/                  # 外部ライブラリのラッパー
├── types/                # TypeScript型定義
├── hooks/                # カスタムフック (React)
├── stores/               # 状態管理 (Redux/Zustand)
└── config/               # アプリケーション設定
```

### Tests (`tests/`)
```
tests/
├── unit/                 # ユニットテスト
│   ├── components/      # コンポーネントテスト
│   ├── services/        # サービステスト
│   └── utils/           # ユーティリティテスト
├── integration/          # 統合テスト
├── e2e/                  # E2Eテスト
├── fixtures/             # テストフィクスチャ
├── mocks/                # モックデータ
└── setup/                # テスト設定
```

### Configuration (`config/`)
```
config/
├── webpack/              # Webpack設定
├── jest/                 # Jest設定
├── eslint/               # ESLint設定
├── database/             # データベース設定
└── environments/         # 環境別設定
```

## Code Organization Patterns

### アーキテクチャパターン
- **[選択されたパターン]**: [MVC/MVP/MVVM/Clean Architecture/DDD]

### レイヤー構造
1. **プレゼンテーション層**: UI/UXロジック
2. **ビジネスロジック層**: ドメインロジック
3. **データアクセス層**: データベース操作
4. **インフラストラクチャ層**: 外部サービス連携

### モジュール設計原則
- **単一責任の原則**: 各モジュールは単一の責任を持つ
- **依存性逆転の原則**: 上位モジュールは下位モジュールに依存しない
- **インターフェース分離**: 必要最小限のインターフェースを定義

## File Naming Conventions

### 一般的な命名規則
- **コンポーネント**: PascalCase (例: `UserProfile.tsx`)
- **ユーティリティ**: camelCase (例: `formatDate.ts`)
- **定数**: UPPER_SNAKE_CASE (例: `API_ENDPOINTS.ts`)
- **設定ファイル**: kebab-case (例: `database-config.ts`)

### ファイル拡張子
- **TypeScript**: `.ts` (ロジック), `.tsx` (React)
- **JavaScript**: `.js` (ロジック), `.jsx` (React)
- **スタイル**: `.module.css`, `.scss`, `.styled.ts`
- **テスト**: `.test.ts`, `.spec.ts`

### 特殊ファイル
- **インデックス**: `index.ts` - ディレクトリのエクスポート
- **型定義**: `types.ts` - TypeScript型定義
- **定数**: `constants.ts` - 定数定義
- **設定**: `config.ts` - 設定値

## Import Organization

### インポート順序
```typescript
// 1. 外部ライブラリ
import React from 'react';
import { useRouter } from 'next/router';

// 2. 内部エイリアス
import { Button } from '@/components/common';
import { useAuth } from '@/hooks';

// 3. 相対パス
import { formatDate } from '../utils';
import styles from './Component.module.css';

// 4. 型定義
import type { User } from '@/types';
```

### パスエイリアス
```json
{
  "@/": "src/",
  "@components/": "src/components/",
  "@utils/": "src/utils/",
  "@types/": "src/types/",
  "@hooks/": "src/hooks/",
  "@api/": "src/api/"
}
```

## Key Architectural Principles

### 設計原則
1. **関心の分離**: ビジネスロジックとUIロジックを分離
2. **再利用性**: 共通コンポーネントとユーティリティの活用
3. **テスタビリティ**: 依存性注入とモックの容易性
4. **保守性**: 明確な責任分担と一貫した構造

### コーディング標準
- **コードスタイル**: [Prettier/ESLint設定に従う]
- **コメント**: JSDocスタイルでの関数ドキュメント
- **エラーハンドリング**: 統一されたエラー処理パターン
- **ログ**: 構造化ログの使用

### パフォーマンス考慮事項
- **遅延読み込み**: 必要に応じてコード分割
- **メモ化**: 計算コストの高い処理のキャッシュ
- **最適化**: バンドルサイズの最小化

### セキュリティガイドライン
- **入力検証**: すべての外部入力を検証
- **認証・認可**: 適切なアクセス制御
- **機密情報**: 環境変数での管理

---

*Note: このドキュメントはプロジェクトの成長に応じて更新してください。*