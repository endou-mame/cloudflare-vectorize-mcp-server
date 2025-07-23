// MCP Server設定
export const MCP_SERVER_CONFIG = {
  NAME: 'cloudflare-vectorize-mcp-server',
  VERSION: '1.0.0',
  PROTOCOL_VERSION: '2024-11-05',
  CAPABILITIES: {
    tools: true,
    resources: false,
    prompts: false,
    logging: true,
  },
} as const;

// HTTPエンドポイント
export const ENDPOINTS = {
  MCP: '/mcp',
  MCP_STREAM: '/mcp/stream',
  HEALTH: '/health',
  INFO: '/mcp/info',
} as const;

// HTTPヘッダー
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT_PLAIN: 'text/plain',
  EVENT_STREAM: 'text/event-stream',
  HTML: 'text/html',
} as const;

// デフォルト設定値
export const DEFAULT_CONFIG = {
  // Vectorize検索設定
  TOP_K: 10,
  THRESHOLD: 0.7,
  INDEX_NAME: 'rag-index',
  
  // キャッシュ設定
  CACHE_TTL_SECONDS: 3600, // 1時間
  CACHE_KEY_PREFIX: 'mcp:cache:',
  
  // レート制限設定
  RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
  RATE_LIMIT_BURST_SIZE: 10,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1分
  
  // リトライ設定
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 5000,
  
  // タイムアウト設定
  REQUEST_TIMEOUT_MS: 30 * 1000, // 30秒
  EMBEDDING_TIMEOUT_MS: 10 * 1000, // 10秒
  VECTORIZE_TIMEOUT_MS: 5 * 1000, // 5秒
  
  // ログ設定
  LOG_LEVEL: 'info',
  MAX_LOG_LENGTH: 1000,
} as const;

// MCPツール定義
export const MCP_TOOLS = {
  SEARCH: {
    name: 'search',
    description: 'Cloudflare Vectorizeに構築されたRAGシステムを検索',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '検索クエリ（自然言語）',
        },
        indexName: {
          type: 'string',
          description: 'Vectorizeインデックス名',
          default: DEFAULT_CONFIG.INDEX_NAME,
        },
        topK: {
          type: 'number',
          description: '返す結果の最大数',
          default: DEFAULT_CONFIG.TOP_K,
          minimum: 1,
          maximum: 100,
        },
        threshold: {
          type: 'number',
          description: '関連性スコアのしきい値（0-1）',
          default: DEFAULT_CONFIG.THRESHOLD,
          minimum: 0,
          maximum: 1,
        },
        includeMetadata: {
          type: 'boolean',
          description: 'メタデータを結果に含めるか',
          default: true,
        },
      },
      required: ['query'],
    },
  },
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  // 一般的なエラー
  INVALID_REQUEST: 'リクエストが無効です',
  METHOD_NOT_FOUND: '指定されたメソッドが見つかりません',
  INVALID_PARAMS: 'パラメータが無効です',
  INTERNAL_ERROR: '内部エラーが発生しました',
  
  // 認証エラー
  AUTH_REQUIRED: '認証が必要です',
  INVALID_TOKEN: '無効な認証トークンです',
  TOKEN_EXPIRED: '認証トークンが期限切れです',
  INSUFFICIENT_PERMISSIONS: '権限が不足しています',
  
  // レート制限エラー
  RATE_LIMIT_EXCEEDED: 'レート制限を超過しました',
  TOO_MANY_REQUESTS: 'リクエストが多すぎます',
  
  // Vectorizeエラー
  VECTORIZE_UNAVAILABLE: 'Vectorizeサービスが利用できません',
  INDEX_NOT_FOUND: '指定されたインデックスが見つかりません',
  SEARCH_FAILED: '検索に失敗しました',
  
  // エンベディングエラー
  EMBEDDING_FAILED: 'テキストのベクトル化に失敗しました',
  EMBEDDING_API_ERROR: 'エンベディングAPIでエラーが発生しました',
  
  // キャッシュエラー
  CACHE_ERROR: 'キャッシュエラーが発生しました',
  CACHE_UNAVAILABLE: 'キャッシュサービスが利用できません',
} as const;

// ログレベル
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// パフォーマンス設定
export const PERFORMANCE = {
  // Workers制限
  MAX_CPU_TIME_MS: 50 * 1000, // 50秒
  MAX_MEMORY_MB: 128,
  
  // ストリーミング制限
  MAX_STREAM_CHUNK_SIZE: 64 * 1024, // 64KB
  STREAM_HIGHWATER_MARK: 16 * 1024, // 16KB
  
  // バックプレッシャー設定
  BACKPRESSURE_THRESHOLD: 0.8, // 80%でバックプレッシャー開始
  MAX_CONCURRENT_REQUESTS: 10,
} as const;