/**
 * Factory functions for generating standard MCP tool definitions
 */

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Create a standard record tool definition
 */
export function createRecordTool(prefix: string): ToolDefinition {
  return {
    name: `${prefix}_record`,
    description: "Record a bet result (win or loss) and get the next bet amount",
    inputSchema: {
      type: "object",
      properties: {
        result: {
          type: "string",
          enum: ["win", "loss"],
          description: "The result of the bet",
        },
      },
      required: ["result"],
    },
  };
}

/**
 * Create a standard status tool definition
 */
export function createStatusTool(prefix: string, description: string): ToolDefinition {
  return {
    name: `${prefix}_status`,
    description,
    inputSchema: {
      type: "object",
      properties: {},
    },
  };
}

/**
 * Create a standard reset tool definition
 */
export function createResetTool(prefix: string, displayName: string): ToolDefinition {
  return {
    name: `${prefix}_reset`,
    description: `Reset the current ${displayName} session to initial state`,
    inputSchema: {
      type: "object",
      properties: {},
    },
  };
}

/**
 * Create a standard statistics tool definition
 */
export function createStatisticsTool(prefix: string, displayName: string): ToolDefinition {
  return {
    name: `${prefix}_statistics`,
    description: `Get detailed statistics for the current ${displayName} session including win rate, ROI, streaks, and risk metrics`,
    inputSchema: {
      type: "object",
      properties: {},
    },
  };
}
