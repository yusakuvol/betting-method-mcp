#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CocomoMethod } from "./methods/cocomo.js";
import { DAlembertMethod } from "./methods/dalembert.js";
import { FibonacciMethod } from "./methods/fibonacci.js";
import { GoodmanMethod } from "./methods/goodman.js";
import { LabouchereMethod } from "./methods/labouchere.js";
import { MartingaleMethod } from "./methods/martingale.js";
import { MonteCarloMethod } from "./methods/montecarlo.js";
import { OscarsGrindMethod } from "./methods/oscarsgrind.js";
import { ParoliMethod } from "./methods/paroli.js";
import { PercentageMethod } from "./methods/percentage.js";

// Initialize method instances
const monteCarlo = new MonteCarloMethod();
const martingale = new MartingaleMethod();
const cocomo = new CocomoMethod();
const dalembert = new DAlembertMethod();
const fibonacci = new FibonacciMethod();
const goodman = new GoodmanMethod();
const labouchere = new LabouchereMethod();
const oscarsGrind = new OscarsGrindMethod();
const paroli = new ParoliMethod();
const percentage = new PercentageMethod();

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
        name: "goodman_init",
        description: "Initialize a new Goodman (1-2-3-5) betting session with a base unit amount",
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
        name: "dalembert_init",
        description:
          "Initialize a new D'Alembert betting session with base unit and optional max bet limit",
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
              description: "Maximum bet amount (optional)",
              minimum: 0.01,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "dalembert_record",
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
        name: "dalembert_status",
        description:
          "Get the current D'Alembert session status including current bet and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "dalembert_reset",
        description: "Reset the current D'Alembert session to initial state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "fibonacci_init",
        description:
          "Initialize a new Fibonacci betting session with base unit and optional maximum index",
        inputSchema: {
          type: "object",
          properties: {
            baseUnit: {
              type: "number",
              description: "The base unit amount for betting (e.g., 1, 10, 100)",
              minimum: 0.01,
            },
            maxIndex: {
              type: "number",
              description: "Maximum sequence index before session ends (optional, default: 20)",
              minimum: 1,
            },
          },
          required: ["baseUnit"],
        },
      },
      {
        name: "fibonacci_record",
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
        name: "fibonacci_status",
        description:
          "Get the current Fibonacci session status including sequence position, current bet, and total profit",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "fibonacci_reset",
        description: "Reset the current Fibonacci session to initial state",
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
      {
        name: "percentage_init",
        description:
          "Initialize a new Percentage (Fixed Percentage Betting) session with bankroll, percentage, and minimum bet",
        inputSchema: {
          type: "object",
          properties: {
            initialBankroll: {
              type: "number",
              description: "The initial bankroll amount (e.g., 1000)",
              minimum: 0.01,
            },
            betPercentage: {
              type: "number",
              description: "The percentage of bankroll to bet (e.g., 0.1 for 10%)",
              minimum: 0.001,
              maximum: 1,
            },
            minBet: {
              type: "number",
              description: "The minimum bet amount (floor when bankroll is low)",
              minimum: 0.01,
            },
          },
          required: ["initialBankroll", "betPercentage", "minBet"],
        },
      },
      {
        name: "percentage_record",
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
        name: "percentage_status",
        description:
          "Get the current Percentage betting session status including bankroll, current bet, and profit percentage",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "percentage_reset",
        description: "Reset the current Percentage betting session to initial state",
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

      case "dalembert_init": {
        const { baseUnit, maxBet } = args as {
          baseUnit: number;
          maxBet?: number;
        };
        dalembert.initSession(baseUnit, maxBet);
        const state = dalembert.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "D'Alembert session initialized",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  maxBet: state.maxBet,
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

      case "dalembert_record": {
        const { result } = args as { result: "win" | "loss" };
        dalembert.recordResult(result);
        const state = dalembert.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBet: state.currentBet,
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

      case "dalembert_status": {
        const state = dalembert.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  maxBet: state.maxBet,
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

      case "dalembert_reset": {
        dalembert.reset();
        const state = dalembert.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentBet: state.currentBet,
                  maxBet: state.maxBet,
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

      case "fibonacci_init": {
        const { baseUnit, maxIndex } = args as { baseUnit: number; maxIndex?: number };
        fibonacci.initSession(baseUnit, maxIndex);
        const state = fibonacci.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Fibonacci session initialized",
                  baseUnit: state.baseUnit,
                  currentIndex: state.currentIndex,
                  currentBet: state.currentBet,
                  maxIndex: state.maxIndex,
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

      case "fibonacci_record": {
        const { result } = args as { result: "win" | "loss" };
        fibonacci.recordResult(result);
        const state = fibonacci.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentIndex: state.currentIndex,
                  currentBet: state.currentBet,
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

      case "fibonacci_status": {
        const state = fibonacci.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  baseUnit: state.baseUnit,
                  currentIndex: state.currentIndex,
                  currentBet: state.currentBet,
                  maxIndex: state.maxIndex,
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

      case "fibonacci_reset": {
        fibonacci.reset();
        const state = fibonacci.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  baseUnit: state.baseUnit,
                  currentIndex: state.currentIndex,
                  currentBet: state.currentBet,
                  maxIndex: state.maxIndex,
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

      case "percentage_init": {
        const { initialBankroll, betPercentage, minBet } = args as {
          initialBankroll: number;
          betPercentage: number;
          minBet: number;
        };
        percentage.initSession(initialBankroll, betPercentage, minBet);
        const state = percentage.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Percentage betting session initialized",
                  initialBankroll: state.initialBankroll,
                  currentBankroll: state.currentBankroll,
                  betPercentage: state.betPercentage,
                  minBet: state.minBet,
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

      case "percentage_record": {
        const { result } = args as { result: "win" | "loss" };
        percentage.recordResult(result);
        const state = percentage.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Recorded ${result}`,
                  currentBankroll: state.currentBankroll,
                  currentBet: state.currentBet,
                  totalProfit: state.totalProfit,
                  profitPercentage: state.profitPercentage,
                  totalWins: state.totalWins,
                  totalLosses: state.totalLosses,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "percentage_status": {
        const state = percentage.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  initialBankroll: state.initialBankroll,
                  currentBankroll: state.currentBankroll,
                  betPercentage: state.betPercentage,
                  minBet: state.minBet,
                  currentBet: state.currentBet,
                  totalWins: state.totalWins,
                  totalLosses: state.totalLosses,
                  totalProfit: state.totalProfit,
                  profitPercentage: state.profitPercentage,
                  sessionActive: state.sessionActive,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      case "percentage_reset": {
        percentage.reset();
        const state = percentage.getState();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: "Session reset to initial state",
                  initialBankroll: state.initialBankroll,
                  currentBankroll: state.currentBankroll,
                  betPercentage: state.betPercentage,
                  minBet: state.minBet,
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
