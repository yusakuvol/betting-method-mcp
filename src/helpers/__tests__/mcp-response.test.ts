import { describe, expect, it } from "vitest";
import { createErrorResponse, createToolResponse } from "../mcp-response.js";

describe("mcp-response helpers", () => {
  describe("createToolResponse", () => {
    it("should create a standard MCP tool response", () => {
      const data = { message: "test", value: 42 };
      const result = createToolResponse(data);

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      });
    });

    it("should handle empty data", () => {
      const result = createToolResponse({});
      expect(result.content[0].text).toBe("{}");
    });

    it("should handle nested objects", () => {
      const data = { nested: { deep: { value: true } } };
      const result = createToolResponse(data);
      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });
  });

  describe("createErrorResponse", () => {
    it("should create an error response from Error instance", () => {
      const error = new Error("Something went wrong");
      const result = createErrorResponse(error);

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Something went wrong" }, null, 2),
          },
        ],
        isError: true,
      });
    });

    it("should handle non-Error objects", () => {
      const result = createErrorResponse("string error");

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "Unknown error" }, null, 2),
          },
        ],
        isError: true,
      });
    });

    it("should handle null error", () => {
      const result = createErrorResponse(null);
      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).error).toBe("Unknown error");
    });
  });
});
