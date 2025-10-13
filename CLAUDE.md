# Claude AI Context - Betting Method MCP Server

This file provides context for Claude AI assistants working on this project.

## Project Overview

**betting-method-mcp** is a Model Context Protocol (MCP) server that provides betting method calculations. It's designed to be used with Claude Desktop and other MCP-compatible clients.

### Key Technologies
- **TypeScript** (strict mode enabled)
- **Node.js** (>=18)
- **MCP SDK** (@modelcontextprotocol/sdk)
- **Vitest** (testing framework)
- **Biome** (linter & formatter)

## Architecture Principles

### 1. Extensibility First
- Each betting method is an independent class
- Common interfaces ensure consistency
- Easy to add new methods following established patterns

### 2. Type Safety
- Strict TypeScript configuration
- All betting methods extend `BettingMethodState`
- Comprehensive type definitions in `src/types.ts`

### 3. Consistent API Pattern
All betting methods expose 4 operations:
- `{method}_init` - Initialize session
- `{method}_record` - Record win/loss
- `{method}_status` - Get current state
- `{method}_reset` - Reset session

## Code Style & Conventions

### TypeScript Style
- **Quotes**: Double quotes (`"`)
- **Semicolons**: Always required
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Trailing commas**: Always
- **Arrow functions**: Always use parentheses

### Naming Conventions
- **Classes**: PascalCase (e.g., `MonteCarloMethod`)
- **Interfaces**: PascalCase with `State` suffix (e.g., `MartingaleState`)
- **Methods**: camelCase (e.g., `recordResult`, `initSession`)
- **MCP Tools**: lowercase with underscore (e.g., `montecarlo_init`)

### File Organization
```
src/
├── index.ts              # MCP server entry point
├── types.ts              # Shared type definitions
└── methods/
    ├── {method}.ts       # Method implementation
    └── __tests__/
        └── {method}.test.ts  # Vitest tests
```

## Implementation Patterns

### 1. Betting Method Class Structure

```typescript
export class MethodNameMethod {
  private state: MethodNameState;

  constructor() {
    // Initialize with default values
  }

  initSession(/* params */): void {
    // Validate parameters
    // Initialize state
  }

  recordResult(result: BetResult): void {
    // Check if session is active
    // Update state based on result
    // Calculate next bet
  }

  getState(): MethodNameState {
    // ALWAYS return a copy, not reference
    return { ...this.state };
  }

  reset(): void {
    // Reset to initial state, keeping parameters
  }
}
```

### 2. State Immutability
Always return copies from `getState()`:
```typescript
getState(): State {
  return { ...this.state };
}
```

### 3. Parameter Validation
Validate all inputs in `initSession()`:
```typescript
if (baseUnit <= 0) {
  throw new Error("baseUnit must be positive");
}
```

### 4. Session Activity Check
Check before processing results:
```typescript
if (!this.state.sessionActive) {
  throw new Error("No active session. Please initialize a session first.");
}
```

## Testing Guidelines

### Test Structure (Vitest)
- Use `describe` blocks to group related tests
- Use `beforeEach` to reset state
- Test all edge cases and error conditions

### Required Test Coverage
- `initSession` - parameter validation, initial state
- `recordResult - win` - win handling, state updates
- `recordResult - loss` - loss handling, state updates
- `recordResult - mixed` - realistic game sequences
- `getState` - immutability verification
- `reset` - state reset with parameter retention
- `error handling` - all error scenarios
- `edge cases` - boundary conditions

### Test Naming
Use descriptive names that explain the scenario:
```typescript
it("should recover all losses plus initial bet on win after losses", () => {
  // test implementation
});
```

## Adding New Betting Methods

### Step-by-Step Process

1. **Define State Interface** (`src/types.ts`)
   ```typescript
   export interface MethodState extends BettingMethodState {
     // Add method-specific properties
   }
   ```

2. **Implement Class** (`src/methods/{method}.ts`)
   - Follow the standard class structure
   - Implement all 4 core methods
   - Add comprehensive validation

3. **Register MCP Tools** (`src/index.ts`)
   - Create method instance
   - Add 4 tool definitions to `ListToolsRequestSchema`
   - Implement 4 handlers in `CallToolRequestSchema`

4. **Write Tests** (`src/methods/__tests__/{method}.test.ts`)
   - Cover all scenarios
   - Aim for 80%+ coverage

5. **Update Documentation**
   - Add to README.md
   - Create specification in `.docs/{method}.md` (optional)

### Use Custom Command
For automated implementation based on GitHub issues:
```
/implement <issue_number>
```

## Common Patterns

### MCP Tool Response Format
```typescript
return {
  content: [
    {
      type: "text",
      text: JSON.stringify(
        {
          message: "Operation description",
          // state properties
        },
        null,
        2,
      ),
    },
  ],
};
```

### Error Handling
```typescript
try {
  // tool logic
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
```

## Development Workflow

### Commands
```bash
# Build
npm run build

# Watch mode (development)
npm run watch

# Run locally
npm run dev

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report

# Linting & Formatting
npm run lint            # Check linting
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code
npm run format:check    # Check formatting
npm run check           # Lint + format check
```

### Before Committing
1. Run `npm run build` - ensure no TypeScript errors
2. Run `npm test` - all tests must pass
3. Run `npm run check` - lint and format checks must pass

## Important Design Decisions

### Why Classes Over Functions?
- Encapsulation of state
- Clear lifecycle (init → record → reset)
- Easy to extend and maintain

### Why Separate State Interfaces?
- Type safety for each method
- Autocomplete support
- Clear documentation of required properties

### Why MCP?
- Standard protocol for AI assistants
- Works with Claude Desktop and compatible clients
- Easy to integrate with existing tools

## Resources

- **Architecture**: See `.docs/architecture.md` (Japanese)
- **Method Specs**: See `.docs/{method}.md` files (Japanese)
- **MCP Docs**: https://modelcontextprotocol.io/
- **Custom Commands**: See `.claude/commands/` directory

## Project Goals

1. **Educational**: Help understand betting strategies
2. **Extensible**: Easy to add new methods
3. **Type-Safe**: Leverage TypeScript fully
4. **Well-Tested**: Comprehensive test coverage
5. **Production-Ready**: Proper error handling and validation

## Disclaimer

This tool is for educational and research purposes only. It does not guarantee profits and should not be used for actual gambling without understanding the risks.
