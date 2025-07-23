// ユーティリティ関数のエクスポート
export * from './logger';

// バリデーション関数
export function isValidString(value: any, minLength = 1): value is string {
  return typeof value === 'string' && value.length >= minLength;
}

export function isValidNumber(value: any, min?: number, max?: number): value is number {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}

export function isValidArray<T>(value: any, validator?: (item: any) => item is T): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }
  if (validator) {
    return value.every(validator);
  }
  return true;
}

// 文字列操作関数
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 時間関連のユーティリティ
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function isExpired(expiresAt: number): boolean {
  return getUnixTimestamp() > expiresAt;
}

export function addSeconds(seconds: number): number {
  return getUnixTimestamp() + seconds;
}

// オブジェクト操作関数
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// エラー処理関数
export function createErrorResponse(code: number, message: string, data?: any) {
  return {
    jsonrpc: '2.0' as const,
    error: {
      code,
      message,
      data,
    },
  };
}

export function safeJsonParse<T = any>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// 非同期処理のユーティリティ
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    delayMs: number;
    maxDelayMs: number;
    backoffMultiplier?: number;
  }
): Promise<T> {
  const { maxRetries, delayMs, maxDelayMs, backoffMultiplier = 2 } = options;
  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      await sleep(Math.min(currentDelay, maxDelayMs));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}

// UUID生成（簡易版）
export function generateId(): string {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}