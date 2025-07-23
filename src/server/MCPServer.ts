import {
  MCPRequest,
  MCPResponse,
  MCPError,
  MCPErrorCode,
  MCPServerError,
  ServerInfo,
  MCPTool,
  ToolCallParams,
  ToolResult,
  CloudflareEnv,
} from '@/types';
import { MCP_SERVER_CONFIG, MCP_TOOLS, ERROR_MESSAGES } from '@/config/constants';
import { getLogger } from '@/utils';

export class MCPServer {
  private readonly logger;

  constructor(env: CloudflareEnv) {
    this.logger = getLogger(env);
  }

  /**
   * MCP Initialize メソッド
   * クライアントとの接続を初期化
   */
  async handleInitialize(params: any): Promise<any> {
    this.logger.info('MCP Initialize request received', { params });

    try {
      const serverInfo: ServerInfo = {
        name: MCP_SERVER_CONFIG.NAME,
        version: MCP_SERVER_CONFIG.VERSION,
        capabilities: MCP_SERVER_CONFIG.CAPABILITIES,
      };

      const result = {
        protocolVersion: MCP_SERVER_CONFIG.PROTOCOL_VERSION,
        capabilities: MCP_SERVER_CONFIG.CAPABILITIES,
        serverInfo,
      };

      this.logger.info('MCP Initialize successful', { result });
      return result;
    } catch (error) {
      this.logger.error('MCP Initialize failed', { error });
      throw new MCPServerError(
        MCPErrorCode.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * MCP ListTools メソッド
   * 利用可能なツールのリストを返す
   */
  async handleListTools(): Promise<{ tools: MCPTool[] }> {
    this.logger.info('MCP ListTools request received');

    try {
      const tools: MCPTool[] = [{
        ...MCP_TOOLS.SEARCH,
        inputSchema: {
          ...MCP_TOOLS.SEARCH.inputSchema,
          required: [...MCP_TOOLS.SEARCH.inputSchema.required]
        }
      }];

      this.logger.info('MCP ListTools successful', { toolCount: tools.length });
      return { tools };
    } catch (error) {
      this.logger.error('MCP ListTools failed', { error });
      throw new MCPServerError(
        MCPErrorCode.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * MCP CallTool メソッド
   * 指定されたツールを実行
   */
  async handleCallTool(params: ToolCallParams): Promise<ToolResult> {
    this.logger.info('MCP CallTool request received', { 
      toolName: params.name, 
      arguments: params.arguments 
    });

    try {
      // ツール名の検証
      if (!params.name) {
        throw new MCPServerError(
          MCPErrorCode.INVALID_PARAMS,
          'Tool name is required'
        );
      }

      // サポートされているツールかチェック
      switch (params.name) {
        case MCP_TOOLS.SEARCH.name:
          return await this.executeSearchTool(params.arguments);
        default:
          throw new MCPServerError(
            MCPErrorCode.METHOD_NOT_FOUND,
            `Unknown tool: ${params.name}`
          );
      }
    } catch (error) {
      this.logger.error('MCP CallTool failed', { 
        toolName: params.name, 
        error 
      });

      if (error instanceof MCPServerError) {
        throw error;
      }

      throw new MCPServerError(
        MCPErrorCode.INTERNAL_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR,
        { originalError: error }
      );
    }
  }

  /**
   * MCP ListResources メソッド
   * 利用可能なリソースのリストを返す（現在は未実装）
   */
  async handleListResources(): Promise<{ resources: any[] }> {
    this.logger.info('MCP ListResources request received');
    
    // 現在はリソース機能を提供していない
    return { resources: [] };
  }

  /**
   * MCP ReadResource メソッド
   * 指定されたリソースを読み取り（現在は未実装）
   */
  async handleReadResource(params: any): Promise<any> {
    this.logger.info('MCP ReadResource request received', { params });
    
    throw new MCPServerError(
      MCPErrorCode.METHOD_NOT_FOUND,
      'ReadResource is not implemented'
    );
  }

  /**
   * 検索ツールの実行
   */
  private async executeSearchTool(args: any): Promise<ToolResult> {
    // パラメータの検証
    if (!args.query || typeof args.query !== 'string') {
      throw new MCPServerError(
        MCPErrorCode.INVALID_PARAMS,
        'query parameter is required and must be a string'
      );
    }

    this.logger.debug('Executing search tool', { arguments: args });

    try {
      // TODO: 実際の検索処理を実装（次のタスクで実装）
      // 現在はモックレスポンスを返す
      const mockResults = {
        results: [
          {
            id: 'doc-1',
            content: 'Sample document content matching the query',
            metadata: {
              documentId: 'doc-1',
              content: 'Sample document content matching the query',
              title: 'Sample Document',
              source: 'mock',
              createdAt: new Date().toISOString(),
            },
            score: 0.95,
          },
        ],
        totalCount: 1,
        processingTime: 100,
      };

      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockResults, null, 2),
          },
        ],
      };

      this.logger.info('Search tool executed successfully', { 
        query: args.query,
        resultCount: mockResults.results.length 
      });

      return result;
    } catch (error) {
      this.logger.error('Search tool execution failed', { 
        query: args.query, 
        error 
      });

      throw new MCPServerError(
        MCPErrorCode.INTERNAL_ERROR,
        'Search execution failed',
        { originalError: error }
      );
    }
  }

  /**
   * MCPリクエストの処理
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logger.debug('Handling MCP request', { 
      method: request.method, 
      id: request.id 
    });

    try {
      let result: any;

      switch (request.method) {
        case 'initialize':
          result = await this.handleInitialize(request.params);
          break;
        case 'tools/list':
          result = await this.handleListTools();
          break;
        case 'tools/call':
          result = await this.handleCallTool(request.params);
          break;
        case 'resources/list':
          result = await this.handleListResources();
          break;
        case 'resources/read':
          result = await this.handleReadResource(request.params);
          break;
        default:
          throw new MCPServerError(
            MCPErrorCode.METHOD_NOT_FOUND,
            `Unknown method: ${request.method}`
          );
      }

      const response: MCPResponse = {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };

      this.logger.debug('MCP request handled successfully', { 
        method: request.method, 
        id: request.id 
      });

      return response;
    } catch (error) {
      this.logger.error('MCP request handling failed', { 
        method: request.method, 
        id: request.id, 
        error 
      });

      let mcpError: MCPError;

      if (error instanceof MCPServerError) {
        mcpError = error.toMCPError();
      } else {
        mcpError = {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
          data: { originalError: error },
        };
      }

      const errorResponse: MCPResponse = {
        jsonrpc: '2.0',
        id: request.id,
        error: mcpError,
      };

      return errorResponse;
    }
  }

  /**
   * サーバー情報の取得
   */
  getServerInfo(): ServerInfo {
    return {
      name: MCP_SERVER_CONFIG.NAME,
      version: MCP_SERVER_CONFIG.VERSION,
      capabilities: MCP_SERVER_CONFIG.CAPABILITIES,
    };
  }
}