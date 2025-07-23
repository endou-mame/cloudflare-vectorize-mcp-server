import { CloudflareEnv } from '@/types';
import { StreamableHTTPTransport } from '@/transport';
import { getLogger } from '@/utils';

/**
 * Cloudflare Worker のメインエントリーポイント
 */
export default {
  async fetch(request: Request, env: CloudflareEnv, _ctx: ExecutionContext): Promise<Response> {
    const logger = getLogger(env);
    
    try {
      logger.info('Worker request received', {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('User-Agent'),
      });

      // HTTPトランスポートでリクエストを処理
      const transport = new StreamableHTTPTransport(env);
      const response = await transport.handleRequest(request);

      logger.info('Worker request completed', {
        status: response.status,
        statusText: response.statusText,
      });

      return response;
    } catch (error) {
      logger.error('Worker request failed', { error });

      // フォールバックエラーレスポンス
      return new Response(
        JSON.stringify({
          error: {
            status: 500,
            title: 'Internal Server Error',
            detail: 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};