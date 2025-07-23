import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// グローバルなテストセットアップ
beforeAll(async () => {
  // テスト開始前の初期化処理
  console.log('🧪 Test suite starting...');
});

afterAll(async () => {
  // テスト終了後のクリーンアップ処理
  console.log('✅ Test suite completed');
});

beforeEach(async () => {
  // 各テスト前の初期化処理
});

afterEach(async () => {
  // 各テスト後のクリーンアップ処理
});

// グローバルなモック設定
global.fetch = fetch;