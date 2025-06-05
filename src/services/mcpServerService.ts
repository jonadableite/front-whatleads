//services/mcpServerService.ts

import type { MCPServer, MCPServerCreate } from "../types/mcpServer";
import { apiEvoAi } from "./api";

export const createMCPServer = (data: MCPServerCreate) =>
	apiEvoAi.post<MCPServer>("/api/v1/mcp-servers/", data);

export const listMCPServers = (skip = 0, limit = 100) =>
	apiEvoAi.get<MCPServer[]>(`/api/v1/mcp-servers/?skip=${skip}&limit=${limit}`);

export const getMCPServer = (id: string) =>
	apiEvoAi.get<MCPServer>(`/api/v1/mcp-servers/${id}`);

export const updateMCPServer = (id: string, data: MCPServerCreate) =>
	apiEvoAi.put<MCPServer>(`/api/v1/mcp-servers/${id}`, data);

export const deleteMCPServer = (id: string) =>
	apiEvoAi.delete(`/api/v1/mcp-servers/${id}`);
