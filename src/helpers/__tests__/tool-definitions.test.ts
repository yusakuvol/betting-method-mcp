import { describe, expect, it } from "vitest";
import {
  createRecordTool,
  createResetTool,
  createStatisticsTool,
  createStatusTool,
} from "../tool-definitions.js";

describe("tool-definitions helpers", () => {
  describe("createRecordTool", () => {
    it("should create a record tool definition with correct name", () => {
      const tool = createRecordTool("montecarlo");
      expect(tool.name).toBe("montecarlo_record");
    });

    it("should have result as required property with enum", () => {
      const tool = createRecordTool("martingale");
      expect(tool.inputSchema.required).toEqual(["result"]);
      const resultProp = tool.inputSchema.properties.result as { enum: string[] };
      expect(resultProp.enum).toEqual(["win", "loss"]);
    });
  });

  describe("createStatusTool", () => {
    it("should create a status tool with custom description", () => {
      const tool = createStatusTool("cocomo", "Get cocomo status");
      expect(tool.name).toBe("cocomo_status");
      expect(tool.description).toBe("Get cocomo status");
    });

    it("should have empty properties", () => {
      const tool = createStatusTool("test", "desc");
      expect(tool.inputSchema.properties).toEqual({});
    });
  });

  describe("createResetTool", () => {
    it("should create a reset tool with display name in description", () => {
      const tool = createResetTool("oscarsgrind", "Oscar's Grind");
      expect(tool.name).toBe("oscarsgrind_reset");
      expect(tool.description).toBe("Reset the current Oscar's Grind session to initial state");
    });

    it("should have empty properties", () => {
      const tool = createResetTool("test", "Test");
      expect(tool.inputSchema.properties).toEqual({});
    });
  });

  describe("createStatisticsTool", () => {
    it("should create a statistics tool with display name", () => {
      const tool = createStatisticsTool("labouchere", "Labouchere");
      expect(tool.name).toBe("labouchere_statistics");
      expect(tool.description).toContain("Labouchere");
      expect(tool.description).toContain("win rate");
      expect(tool.description).toContain("ROI");
    });

    it("should have empty properties", () => {
      const tool = createStatisticsTool("test", "Test");
      expect(tool.inputSchema.properties).toEqual({});
    });
  });
});
