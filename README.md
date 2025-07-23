# Cloudflare Vectorize MCP Server

Cloudflare Worker上で動作するRemote MCP ServerをStreamable HTTP Transportで実装したRAG検索システム。

## 概要

このプロジェクトは、Cloudflare Vectorizeに構築されたRAGシステムに対してMCP（Model Context Protocol）経由で検索を実行できるサーバーです。

### 主な機能

- **MCP準拠**: 標準的なMCPプロトコルに対応
- **Streamable HTTP Transport**: Server-Sent Events (SSE)によるリアルタイムストリーミング
- **Cloudflare Vectorize統合**: ベクトル検索を活用した高度な情報検索
- **認証・セキュリティ**: Bearer Token認証とレート制限
- **キャッシング**: Cloudflare KVを使用した高速レスポンス

## 技術スタック

- **Runtime**: Cloudflare Workers (V8 Isolate)
- **Language**: TypeScript
- **MCP Framework**: @modelcontextprotocol/sdk
- **Vector Database**: Cloudflare Vectorize
- **Cache**: Cloudflare KV
- **Session Management**: Cloudflare Durable Objects
- **Build Tool**: Wrangler CLI
- **Testing**: Vitest + Miniflare

## セットアップ

### 前提条件

- Node.js >= 18.0.0
- npm >= 8.0.0
- Wrangler CLI
- Cloudflareアカウント

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

### 開発

```bash
# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# 型チェック
npm run typecheck

# リンター
npm run lint
```

### デプロイ

```bash
# ステージング環境
npm run deploy:staging

# プロダクション環境
npm run deploy:production
```

## API エンドポイント

- `POST /mcp` - MCP JSON-RPCエンドポイント  
- `POST /mcp/stream` - SSEストリーミングエンドポイント
- `GET /health` - ヘルスチェック
- `GET /mcp/info` - サーバー情報

## MCP ツール

### search

Cloudflare Vectorizeに構築されたRAGシステムを検索します。

#### パラメータ

- `query` (string, required): 検索クエリ（自然言語）
- `indexName` (string, optional): Vectorizeインデックス名 (default: "rag-index")
- `topK` (number, optional): 返す結果の最大数 (default: 10)
- `threshold` (number, optional): 関連性スコアのしきい値 (default: 0.7)
- `includeMetadata` (boolean, optional): メタデータを結果に含めるか (default: true)

#### レスポンス例

```json
{
  "results": [
    {
      "id": "doc-1",
      "content": "検索結果のコンテンツ",
      "metadata": {
        "title": "ドキュメントタイトル",
        "source": "ソース情報"
      },
      "score": 0.95
    }
  ],
  "totalCount": 1,
  "processingTime": 100
}
```

## 開発ガイド

このプロジェクトは[Kiro-style Spec-Driven Development](./CLAUDE.md)に従って開発されています。

- 仕様書: `.kiro/specs/cloudflare-vectorize-mcp-server/`
- ステアリングドキュメント: `.kiro/steering/`

## ライセンス

MIT License