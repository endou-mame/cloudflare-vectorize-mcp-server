import {
  MCPRequest,
  MCPErrorCode,
  CloudflareEnv,
  SSEMessage,
} from '@/types';
import { 
  ENDPOINTS, 
  HTTP_HEADERS, 
  CONTENT_TYPES, 
  ERROR_MESSAGES 
} from '@/config/constants';
import { getLogger, safeJsonParse, createErrorResponse } from '@/utils';
import { MCPServer } from '@/server';

export class StreamableHTTPTransport {
  private readonly logger;
  private readonly mcpServer: MCPServer;

  constructor(private readonly env: CloudflareEnv) {
    this.logger = getLogger(env);
    this.mcpServer = new MCPServer(env);
  }

  /**
   * メインのリクエストハンドラ
   */
  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    this.logger.info('HTTP request received', { 
      method: request.method, 
      pathname,
      headers: Object.fromEntries(request.headers.entries())
    });

    try {
      // CORS対応
      if (request.method === 'OPTIONS') {
        return this.handleCORS(request);
      }

      // エンドポイントのルーティング
      switch (pathname) {
        case ENDPOINTS.MCP:
          return await this.handleMCPRequest(request);
        case ENDPOINTS.MCP_STREAM:
          return await this.handleStreamingRequest(request);
        case ENDPOINTS.HEALTH:
          return this.handleHealthCheck();
        case ENDPOINTS.INFO:
          return this.handleServerInfo();
        default:
          return this.createErrorResponse(404, 'Not Found', 'Endpoint not found');
      }
    } catch (error) {
      this.logger.error('Request handling failed', { 
        pathname, 
        method: request.method, 
        error 
      });

      return this.createErrorResponse(
        500, 
        ERROR_MESSAGES.INTERNAL_ERROR,
        'Internal server error'
      );
    }
  }

  /**
   * 通常のMCP JSON-RPCリクエストの処理
   */
  private async handleMCPRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return this.createErrorResponse(405, 'Method Not Allowed', 'Only POST is allowed');
    }

    try {
      const body = await request.text();
      const mcpRequest = safeJsonParse<MCPRequest>(body);

      if (!mcpRequest) {
        return new Response(
          JSON.stringify(createErrorResponse(
            MCPErrorCode.PARSE_ERROR,
            'Invalid JSON'
          )),
          {
            status: 400,
            headers: {
              [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
              ...this.getCORSHeaders(),
            },
          }
        );
      }

      // MCP リクエストの基本検証
      if (mcpRequest.jsonrpc !== '2.0') {
        return new Response(
          JSON.stringify(createErrorResponse(
            MCPErrorCode.INVALID_REQUEST,
            'Invalid JSON-RPC version'
          )),
          {
            status: 400,
            headers: {
              [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
              ...this.getCORSHeaders(),
            },
          }
        );
      }

      // MCPサーバーでリクエストを処理
      const mcpResponse = await this.mcpServer.handleRequest(mcpRequest);

      return new Response(JSON.stringify(mcpResponse), {
        status: 200,
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
          [HTTP_HEADERS.CACHE_CONTROL]: 'no-cache, no-store, must-revalidate',
          ...this.getCORSHeaders(),
        },
      });
    } catch (error) {
      this.logger.error('MCP request processing failed', { error });

      const errorResponse = createErrorResponse(
        MCPErrorCode.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
          ...this.getCORSHeaders(),
        },
      });
    }
  }

  /**
   * Server-Sent Events (SSE) ストリーミングリクエストの処理
   */
  private async handleStreamingRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return this.createErrorResponse(405, 'Method Not Allowed', 'Only POST is allowed');
    }

    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader !== CONTENT_TYPES.EVENT_STREAM) {
      return this.createErrorResponse(400, 'Bad Request', 'Accept: text/event-stream header required');
    }

    try {
      const body = await request.text();
      const mcpRequest = safeJsonParse<MCPRequest>(body);

      if (!mcpRequest) {
        return this.createSSEErrorResponse('Invalid JSON');
      }

      // ReadableStreamを作成してSSEレスポンスを構築
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // 非同期でMCPリクエストを処理し、結果をストリーミング
      this.processStreamingMCPRequest(mcpRequest, writer);

      return new Response(readable, {
        status: 200,
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.EVENT_STREAM,
          [HTTP_HEADERS.CACHE_CONTROL]: 'no-cache',
          'Connection': 'keep-alive',
          ...this.getCORSHeaders(),
        },
      });
    } catch (error) {
      this.logger.error('Streaming request processing failed', { error });
      return this.createSSEErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  /**
   * ストリーミングMCPリクエストの非同期処理
   */
  private async processStreamingMCPRequest(
    mcpRequest: MCPRequest,
    writer: WritableStreamDefaultWriter<Uint8Array>
  ): Promise<void> {
    try {
      // 開始イベントを送信
      await this.writeSSEMessage(writer, {
        event: 'start',
        data: JSON.stringify({ method: mcpRequest.method }),
      });

      // MCPリクエストを処理
      const mcpResponse = await this.mcpServer.handleRequest(mcpRequest);

      // 結果イベントを送信
      await this.writeSSEMessage(writer, {
        event: 'result',
        data: JSON.stringify(mcpResponse),
      });

      // 完了イベントを送信
      await this.writeSSEMessage(writer, {
        event: 'done',
        data: JSON.stringify({ status: 'completed' }),
      });
    } catch (error) {
      this.logger.error('Streaming MCP request processing failed', { error });

      // エラーイベントを送信
      await this.writeSSEMessage(writer, {
        event: 'error',
        data: JSON.stringify({
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          details: error instanceof Error ? error.message : String(error),
        }),
      });
    } finally {
      try {
        await writer.close();
      } catch (error) {
        this.logger.warn('Failed to close SSE writer', { error });
      }
    }
  }

  /**
   * SSEメッセージの書き込み
   */
  private async writeSSEMessage(
    writer: WritableStreamDefaultWriter<Uint8Array>,
    message: SSEMessage
  ): Promise<void> {
    let sseData = '';

    if (message.id) {
      sseData += `id: ${message.id}\\n`;
    }
    if (message.event) {
      sseData += `event: ${message.event}\\n`;
    }
    if (message.retry) {
      sseData += `retry: ${message.retry}\\n`;
    }

    sseData += `data: ${message.data}\\n\\n`;

    const encoder = new TextEncoder();
    await writer.write(encoder.encode(sseData));
  }

  /**
   * ヘルスチェックエンドポイント
   */
  private handleHealthCheck(): Response {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this.env.MCP_SERVER_VERSION || '1.0.0',
      environment: this.env.ENVIRONMENT || 'unknown',
    };

    return new Response(JSON.stringify(healthStatus), {
      status: 200,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        ...this.getCORSHeaders(),
      },
    });
  }

  /**
   * サーバー情報エンドポイント
   */
  private handleServerInfo(): Response {
    const serverInfo = this.mcpServer.getServerInfo();

    return new Response(JSON.stringify(serverInfo), {
      status: 200,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        ...this.getCORSHeaders(),
      },
    });
  }

  /**
   * CORS対応
   */
  private handleCORS(_request: Request): Response {
    return new Response(null, {
      status: 204,
      headers: this.getCORSHeaders(),
    });
  }

  /**
   * CORSヘッダーの取得
   */
  private getCORSHeaders(): Record<string, string> {
    return {
      [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN]: '*',
      [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_METHODS]: 'GET, POST, OPTIONS',
      [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS]: 'Content-Type, Authorization',
    };
  }

  /**
   * エラーレスポンスの作成
   */
  private createErrorResponse(status: number, title: string, detail: string): Response {
    const errorBody = {
      error: {
        status,
        title,
        detail,
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(errorBody), {
      status,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
        ...this.getCORSHeaders(),
      },
    });
  }

  /**
   * SSEエラーレスポンスの作成
   */
  private createSSEErrorResponse(message: string): Response {
    const errorMessage = `event: error\\ndata: ${JSON.stringify({ error: message })}\\n\\n`;
    
    return new Response(errorMessage, {
      status: 400,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.EVENT_STREAM,
        ...this.getCORSHeaders(),
      },
    });
  }
}