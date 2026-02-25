/**
 * MCP response formatting helpers
 */

/**
 * Create a standard MCP tool response with JSON content
 */
export function createToolResponse(data: Record<string, unknown>) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Create a standard MCP error response
 */
export function createErrorResponse(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: errorMessage }, null, 2),
      },
    ],
    isError: true,
  };
}
