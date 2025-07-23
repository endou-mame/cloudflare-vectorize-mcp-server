import { describe, it, expect, beforeEach } from 'vitest';
import { MCPServer } from '@/server/MCPServer';
import { CloudflareEnv, MCPRequest, MCPErrorCode } from '@/types';

// モック環境の作成
const createMockEnv = (): CloudflareEnv => ({
  VECTORIZE_INDEX: {} as any,
  CACHE_KV: {} as any,
  AUTH_KV: {} as any,
  RATE_LIMITER: {} as any,
  ENVIRONMENT: 'test',
  LOG_LEVEL: 'debug',
  MCP_SERVER_VERSION: '1.0.0',
});

describe('MCPServer', () => {
  let mcpServer: MCPServer;
  let mockEnv: CloudflareEnv;

  beforeEach(() => {
    mockEnv = createMockEnv();
    mcpServer = new MCPServer(mockEnv);
  });

  describe('handleInitialize', () => {
    it('should return server info on initialize', async () => {
      const result = await mcpServer.handleInitialize({});

      expect(result).toEqual({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          logging: true,
        },
        serverInfo: {
          name: 'cloudflare-vectorize-mcp-server',
          version: '1.0.0',
          capabilities: {
            tools: true,
            resources: false,
            prompts: false,
            logging: true,
          },
        },
      });
    });
  });

  describe('handleListTools', () => {
    it('should return available tools', async () => {
      const result = await mcpServer.handleListTools();

      expect(result).toEqual({
        tools: [
          {
            name: 'search',
            description: 'Cloudflare Vectorizeに構築されたRAGシステムを検索',
            inputSchema: expect.objectContaining({
              type: 'object',
              properties: expect.objectContaining({
                query: expect.objectContaining({
                  type: 'string',
                  description: '検索クエリ（自然言語）',
                }),
              }),
              required: ['query'],
            }),
          },
        ],
      });
    });
  });

  describe('handleCallTool', () => {
    it('should execute search tool with valid parameters', async () => {
      const params = {
        name: 'search',
        arguments: {
          query: 'test query',
          topK: 5,
        },
      };

      const result = await mcpServer.handleCallTool(params);

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Sample document content'),
          },
        ],
      });
    });

    it('should throw error for missing tool name', async () => {
      const params = {
        name: '',
        arguments: {},
      };

      await expect(mcpServer.handleCallTool(params)).rejects.toThrow();
    });

    it('should throw error for unknown tool', async () => {
      const params = {
        name: 'unknown_tool',
        arguments: {},
      };

      await expect(mcpServer.handleCallTool(params)).rejects.toThrow();
    });

    it('should throw error for missing query parameter', async () => {
      const params = {
        name: 'search',
        arguments: {},
      };

      await expect(mcpServer.handleCallTool(params)).rejects.toThrow();
    });
  });

  describe('handleRequest', () => {
    it('should handle initialize request', async () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should handle tools/list request', async () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(2);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toHaveLength(1);
    });

    it('should handle tools/call request', async () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'search',
          arguments: {
            query: 'test query',
          },
        },
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(3);
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should return error for unknown method', async () => {
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'unknown_method',
      };

      const response = await mcpServer.handleRequest(request);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(4);
      expect(response.result).toBeUndefined();
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
    });
  });

  describe('getServerInfo', () => {
    it('should return server information', () => {
      const serverInfo = mcpServer.getServerInfo();

      expect(serverInfo).toEqual({
        name: 'cloudflare-vectorize-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          logging: true,
        },
      });
    });
  });
});