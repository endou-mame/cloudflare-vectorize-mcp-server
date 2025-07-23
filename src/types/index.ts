// MCP関連の型定義
export interface MCPRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

// MCP標準エラーコード
export enum MCPErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // カスタムエラーコード
  VECTORIZE_ERROR = -32001,
  EMBEDDING_ERROR = -32002,
  RATE_LIMIT_ERROR = -32003,
  AUTH_ERROR = -32004,
  CACHE_ERROR = -32005,
}

// MCP Server情報
export interface ServerInfo {
  name: string;
  version: string;
  capabilities: ServerCapabilities;
}

export interface ServerCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  logging?: boolean;
}

// MCP Tool定義
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCallParams {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// Vectorize関連の型定義
export interface VectorizeMetadata {
  documentId: string;
  content: string;
  title?: string;
  source?: string;
  createdAt: string;
  tags?: string[];
  [key: string]: any;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: VectorizeMetadata;
  score: number;
  highlights?: string[];
}

export interface SearchParams {
  query: string;
  indexName?: string;
  topK?: number;
  threshold?: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  queryEmbedding?: number[];
  processingTime: number;
}

// HTTP Transport関連の型定義
export interface StreamingResponse {
  readable: ReadableStream;
  writable: WritableStream;
}

export interface SSEMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

// 認証関連の型定義
export interface AuthContext {
  userId?: string;
  tokenId: string;
  permissions: string[];
  rateLimit: {
    remaining: number;
    resetTime: number;
  };
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  burstSize: number;
  windowSizeMs: number;
}

// キャッシュ関連の型定義
export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

// エラー関連の型定義
export class MCPServerError extends Error {
  constructor(
    public code: MCPErrorCode,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPServerError';
  }

  toMCPError(): MCPError {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

// Cloudflare Worker環境の型定義
export interface CloudflareEnv {
  // Vectorize バインディング
  VECTORIZE_INDEX: VectorizeIndex;
  
  // KV ストレージ
  CACHE_KV: KVNamespace;
  AUTH_KV: KVNamespace;
  
  // Durable Objects
  RATE_LIMITER: DurableObjectNamespace;
  
  // 環境変数
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  MCP_SERVER_VERSION: string;
  EMBEDDING_API_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  CLOUDFLARE_AI_API_TOKEN?: string;
  AUTH_ENABLED?: string;
  RATE_LIMIT_REQUESTS_PER_MINUTE?: string;
  CACHE_TTL_SECONDS?: string;
}

// Vectorize Index型定義（Cloudflare提供の型を拡張）
export interface VectorizeIndex {
  query(
    vector: number[],
    options?: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
      includeValues?: boolean;
    }
  ): Promise<{
    matches: Array<{
      id: string;
      score: number;
      values?: number[];
      metadata?: Record<string, any>;
    }>;
  }>;
  
  insert(vectors: Array<{
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }>): Promise<void>;
  
  upsert(vectors: Array<{
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }>): Promise<void>;
  
  deleteByIds(ids: string[]): Promise<void>;
}

// ユーティリティ型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};