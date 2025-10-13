#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { GoodmanMethod } from "./methods/goodman.js";
import { MartingaleMethod } from "./methods/martingale.js";
import { MonteCarloMethod } from "./methods/montecarlo.js";

// Initialize method instances
const monteCarlo = new MonteCarloMethod();
const martingale = new MartingaleMethod();
const goodman = new GoodmanMethod();

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
        name: "goodman_init",
        description:
          "Initialize a new Goodman (1-2-3-5) betting session with a base unit amount",
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
        name: "goodman_record",
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
        name: "goodman_status",
        description:
          "Get the current Goodman session status including current bet, step, win streak, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "goodman_reset",
        description: "Reset the current Goodman session to initial state",
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

      case "goodman_init": {
        const { baseUnit } = args as { baseUnit: number };
        goodman.initSession(baseUnit);
        const state = goodman.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Goodman session initialized",
                  baseUnit: state.baseUnit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  currentStep: state.currentStep,
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

      case "goodman_record": {
        const { result } = args as { result: "win" | "loss" };
        goodman.recordResult(result);
        const state = goodman.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
                  currentStep: state.currentStep,
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

      case "goodman_status": {
        const state = goodman.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  sequence: state.sequence,
                  currentBet: state.currentBet,
                  currentStep: state.currentStep,
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

      case "goodman_reset": {
        goodman.reset();
        const state = goodman.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  currentStep: state.currentStep,
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
