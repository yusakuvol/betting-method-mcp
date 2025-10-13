#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CocomoMethod } from "./methods/cocomo.js";
import { LabouchereMethod } from "./methods/labouchere.js";
import { MartingaleMethod } from "./methods/martingale.js";
import { MonteCarloMethod } from "./methods/montecarlo.js";
import { OscarsGrindMethod } from "./methods/oscarsgrind.js";
import { ParoliMethod } from "./methods/paroli.js";

// Initialize method instances
const monteCarlo = new MonteCarloMethod();
const martingale = new MartingaleMethod();
const cocomo = new CocomoMethod();
const labouchere = new LabouchereMethod();
const oscarsGrind = new OscarsGrindMethod();
const paroli = new ParoliMethod();

// Create MCP server
const server = new Server(
  {
    name: "betting-method-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "montecarlo_init",
        description: "Initialize a new Monte Carlo betting session with a base unit amount",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "montecarlo_record",
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
      },
      {
        name: "montecarlo_status",
        description:
          "Get the current Monte Carlo session status including sequence, current bet, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "montecarlo_reset",
        description: "Reset the current Monte Carlo session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "martingale_init",
        description:
          "Initialize a new Martingale betting session with base unit and optional limits",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            maxBet: {
              type: "number",
              description: "Maximum bet amount (optional, default: baseUnit × 1024)",
              minimum: 0.01,
            },
            maxLossStreak: {
              type: "number",
              description: "Maximum consecutive losses before session ends (optional, default: 10)",
              minimum: 1,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "martingale_record",
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
      },
      {
        name: "martingale_status",
        description:
          "Get the current Martingale session status including current bet, streak, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "martingale_reset",
        description: "Reset the current Martingale session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cocomo_init",
        description:
          "Initialize a new Cocomo betting session with base unit and optional max bet limit",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            maxBet: {
              type: "number",
              description: "Maximum bet amount (optional, default: baseUnit × 1000)",
              minimum: 0.01,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "cocomo_record",
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
      },
      {
        name: "cocomo_status",
        description:
          "Get the current Cocomo session status including current bet, streak, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cocomo_reset",
        description: "Reset the current Cocomo session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "labouchere_init",
        description:
          "Initialize a new Labouchere betting session with target profit and optional sequence",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            targetProfit: {
              type: "number",
              description: "Target profit in units (e.g., 10, 20, 100)",
              minimum: 0.01,
            },
            initialSequence: {
              type: "array",
              description:
                "Initial number sequence (optional, must sum to targetProfit, e.g., [1, 2, 3, 4] for target 10)",
              items: {
                type: "number",
              },
            },
            maxSequenceLength: {
              type: "number",
              description: "Maximum sequence length before session ends (optional, default: 20)",
              minimum: 1,
            },
          },
          required: ["baseUnit", "targetProfit"],
        },
      },
      {
        name: "labouchere_record",
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
      },
      {
        name: "labouchere_status",
        description:
          "Get the current Labouchere session status including sequence, current bet, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "labouchere_reset",
        description: "Reset the current Labouchere session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "oscarsgrind_init",
        description:
          "Initialize a new Oscar's Grind betting session with base unit and optional parameters",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            targetProfitUnits: {
              type: "number",
              description: "Target profit in units (optional, default: 1)",
              minimum: 0.01,
            },
            maxBetUnits: {
              type: "number",
              description: "Maximum bet in units (optional, default: targetProfitUnits × 10)",
              minimum: 1,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "oscarsgrind_record",
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
      },
      {
        name: "oscarsgrind_status",
        description:
          "Get the current Oscar's Grind session status including current bet, profit, and sessions completed",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "oscarsgrind_reset",
        description: "Reset the current Oscar's Grind session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "paroli_init",
        description:
          "Initialize a new Paroli betting session with base unit and optional target win streak",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            targetWinStreak: {
              type: "number",
              description: "Target consecutive wins before resetting (optional, default: 3)",
              minimum: 1,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "paroli_record",
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
      },
      {
        name: "paroli_status",
        description:
          "Get the current Paroli session status including current bet, win streak, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "paroli_reset",
        description: "Reset the current Paroli session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "montecarlo_init": {
        const { baseUnit } = args as { baseUnit: number };
        monteCarlo.initSession(baseUnit);
        const state = monteCarlo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Monte Carlo session initialized",
                  baseUnit: state.baseUnit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "montecarlo_record": {
        const { result } = args as { result: "win" | "loss" };
        monteCarlo.recordResult(result);
        const state = monteCarlo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionComplete: !state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "montecarlo_status": {
        const state = monteCarlo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "montecarlo_reset": {
        monteCarlo.reset();
        const state = monteCarlo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "martingale_init": {
        const { baseUnit, maxBet, maxLossStreak } = args as {
          baseUnit: number;
          maxBet?: number;
          maxLossStreak?: number;
        };
        martingale.initSession(baseUnit, maxBet, maxLossStreak);
        const state = martingale.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Martingale session initialized",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  maxBet: state.maxBet,
                  maxLossStreak: state.maxLossStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "martingale_record": {
        const { result } = args as { result: "win" | "loss" };
        martingale.recordResult(result);
        const state = martingale.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
                  currentStreak: state.currentStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  reachedLimit: state.reachedLimit,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "martingale_status": {
        const state = martingale.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  currentStreak: state.currentStreak,
                  maxBet: state.maxBet,
                  maxLossStreak: state.maxLossStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  reachedLimit: state.reachedLimit,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "martingale_reset": {
        martingale.reset();
        const state = martingale.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "cocomo_init": {
        const { baseUnit, maxBet } = args as {
          baseUnit: number;
          maxBet?: number;
        };
        cocomo.initSession(baseUnit, maxBet);
        const state = cocomo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Cocomo session initialized",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  maxBet: state.maxBet,
                  payoutMultiplier: state.payoutMultiplier,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "cocomo_record": {
        const { result } = args as { result: "win" | "loss" };
        cocomo.recordResult(result);
        const state = cocomo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
                  previousBet: state.previousBet,
                  currentStreak: state.currentStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  reachedLimit: state.reachedLimit,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "cocomo_status": {
        const state = cocomo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  previousBet: state.previousBet,
                  currentStreak: state.currentStreak,
                  maxBet: state.maxBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  reachedLimit: state.reachedLimit,
                  payoutMultiplier: state.payoutMultiplier,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "cocomo_reset": {
        cocomo.reset();
        const state = cocomo.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "labouchere_init": {
        const { baseUnit, targetProfit, initialSequence, maxSequenceLength } = args as {
          baseUnit: number;
          targetProfit: number;
          initialSequence?: number[];
          maxSequenceLength?: number;
        };
        labouchere.initSession(baseUnit, targetProfit, initialSequence, maxSequenceLength);
        const state = labouchere.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Labouchere session initialized",
                  baseUnit: state.baseUnit,
                  targetProfit: state.targetProfit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  maxSequenceLength: state.maxSequenceLength,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "labouchere_record": {
        const { result } = args as { result: "win" | "loss" };
        labouchere.recordResult(result);
        const state = labouchere.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                  reachedLimit: state.reachedLimit,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "labouchere_status": {
        const state = labouchere.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  targetProfit: state.targetProfit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  maxSequenceLength: state.maxSequenceLength,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                  reachedLimit: state.reachedLimit,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "labouchere_reset": {
        labouchere.reset();
        const state = labouchere.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  targetProfit: state.targetProfit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "oscarsgrind_init": {
        const { baseUnit, targetProfitUnits, maxBetUnits } = args as {
          baseUnit: number;
          targetProfitUnits?: number;
          maxBetUnits?: number;
        };
        oscarsGrind.initSession(baseUnit, targetProfitUnits, maxBetUnits);
        const state = oscarsGrind.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Oscar's Grind session initialized",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  currentBetUnits: state.currentBetUnits,
                  maxBetUnits: state.maxBetUnits,
                  targetProfitUnits: state.targetProfitUnits,
                  currentProfitUnits: state.currentProfitUnits,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "oscarsgrind_record": {
        const { result } = args as { result: "win" | "loss" };
        oscarsGrind.recordResult(result);
        const state = oscarsGrind.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
                  currentBetUnits: state.currentBetUnits,
                  currentProfitUnits: state.currentProfitUnits,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "oscarsgrind_status": {
        const state = oscarsGrind.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  currentBetUnits: state.currentBetUnits,
                  maxBetUnits: state.maxBetUnits,
                  targetProfitUnits: state.targetProfitUnits,
                  currentProfitUnits: state.currentProfitUnits,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "oscarsgrind_reset": {
        oscarsGrind.reset();
        const state = oscarsGrind.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  currentBetUnits: state.currentBetUnits,
                  targetProfitUnits: state.targetProfitUnits,
                  currentProfitUnits: state.currentProfitUnits,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  sessionsCompleted: state.sessionsCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "paroli_init": {
        const { baseUnit, targetWinStreak } = args as {
          baseUnit: number;
          targetWinStreak?: number;
        };
        paroli.initSession(baseUnit, targetWinStreak);
        const state = paroli.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Paroli session initialized",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  targetWinStreak: state.targetWinStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "paroli_record": {
        const { result } = args as { result: "win" | "loss" };
        paroli.recordResult(result);
        const state = paroli.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
                  winStreak: state.winStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  cyclesCompleted: state.cyclesCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "paroli_status": {
        const state = paroli.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  winStreak: state.winStreak,
                  targetWinStreak: state.targetWinStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  cyclesCompleted: state.cyclesCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "paroli_reset": {
        paroli.reset();
        const state = paroli.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  targetWinStreak: state.targetWinStreak,
                  winStreak: state.winStreak,
                  totalProfit: state.totalProfit,
                  sessionActive: state.sessionActive,
                  cyclesCompleted: state.cyclesCompleted,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Betting Method MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
