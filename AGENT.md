# AI Agent Context - Betting Method MCP Server

This file provides essential context for any AI coding assistant working on this project.

## Project Summary

**betting-method-mcp** is a TypeScript-based MCP (Model Context Protocol) server that provides betting method calculations. It exposes betting strategies like Monte Carlo and Martingale through a standardized API.

**Stack**: TypeScript (strict), Node.js >=18, MCP SDK, Vitest, Biome

**Purpose**: Educational tool to understand and calculate betting strategies

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development (watch mode)
npm run watch

# Lint & format
npm run check
```

## Project Structure

```
betting-method-mcp/
├── src/
│   ├── index.ts                    # MCP server entry point & tool registration
│   ├── types.ts                    # Shared TypeScript interfaces
│   └── methods/
│       ├── montecarlo.ts           # Monte Carlo method implementation
│       ├── martingale.ts           # Martingale method implementation
│       └── __tests__/              # Vitest test files
│           ├── montecarlo.test.ts
│           └── martingale.test.ts
├── .claude/                        # Claude Code configuration
│   ├── commands/                   # Custom slash commands
│   └── settings.local.json
├── .docs/                          # Detailed specifications (Japanese)
│   ├── architecture.md
│   └── martingale.md
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline
├── build/                          # Compiled JavaScript output
├── biome.json                      # Biome linter/formatter config
├── vitest.config.ts                # Test configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
├── CLAUDE.md                       # Claude-specific context
├── AGENT.md                        # This file
└── README.md                       # User documentation
```

## Core Concepts

### 1. Betting Method Pattern

Each betting method follows this pattern:

```typescript
class MethodNameMethod {
  private state: MethodNameState;

  constructor() { /* default init */ }
  initSession(params): void { /* setup */ }
  recordResult(result: "win" | "loss"): void { /* update state */ }
  getState(): MethodNameState { /* return copy */ }
  reset(): void { /* restart */ }
}
```

### 2. MCP Tools

Each method exposes 4 MCP tools:
- `{method}_init` - Initialize betting session
- `{method}_record` - Record win/loss result
- `{method}_status` - Get current state
- `{method}_reset` - Reset to initial state

### 3. State Management

- All state is defined in `src/types.ts`
- States extend `BettingMethodState` base interface
- `getState()` **must** return a copy (immutable pattern)

## Code Style (Biome)

- **Quotes**: Double (`"`)
- **Semicolons**: Always
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Trailing commas**: All
- **Arrow parens**: Always

Run `npm run format` to auto-format code.

## Development Guidelines

### Adding a New Betting Method

1. **Add State Type** (`src/types.ts`)
   ```typescript
   export interface NewMethodState extends BettingMethodState {
     // method-specific properties
   }
   ```

2. **Implement Class** (`src/methods/newmethod.ts`)
   - Follow existing pattern (see montecarlo.ts)
   - Validate all inputs
   - Handle errors gracefully

3. **Register MCP Tools** (`src/index.ts`)
   - Create instance
   - Add 4 tool definitions
   - Add 4 tool handlers

4. **Write Tests** (`src/methods/__tests__/newmethod.test.ts`)
   - Use Vitest
   - Cover all edge cases
   - Aim for 80%+ coverage

5. **Update Docs** (README.md)

### Testing Checklist

Tests must cover:
- ✅ Parameter validation
- ✅ Win scenarios
- ✅ Loss scenarios
- ✅ Mixed win/loss sequences
- ✅ State immutability
- ✅ Session reset
- ✅ Error handling
- ✅ Edge cases (limits, boundaries)

### Pre-Commit Checklist

- ✅ `npm run build` - No TypeScript errors
- ✅ `npm test` - All tests pass
- ✅ `npm run check` - Lint & format pass

## Common Tasks

### Task: Implement New Betting Method from GitHub Issue

Use the custom command:
```
/implement <issue_number>
```

This automates:
- Fetching issue details
- Generating method implementation
- Creating tests
- Registering MCP tools

See `.claude/commands/implement.md` for details.

### Task: Fix TypeScript Error

1. Check error message carefully
2. Common issues:
   - Missing return type
   - Null/undefined handling
   - Type mismatches in state
3. Run `npm run build` to verify

### Task: Add Test Coverage

1. Identify untested code paths
2. Add test cases to `__tests__/{method}.test.ts`
3. Run `npm run test:coverage` to verify

### Task: Update MCP Tool Schema

1. Modify tool definition in `ListToolsRequestSchema` handler
2. Update corresponding handler in `CallToolRequestSchema`
3. Update README.md with new parameters

## Important Files

### `src/index.ts`
- MCP server initialization
- Tool registration
- Request handlers
- **Modify**: When adding new methods or changing tool schemas

### `src/types.ts`
- All TypeScript interfaces
- Base `BettingMethodState` interface
- Method-specific state interfaces
- **Modify**: When adding new methods or state properties

### `src/methods/{method}.ts`
- Individual betting method implementation
- Core business logic
- **Modify**: When updating calculation logic

### `biome.json`
- Linter & formatter configuration
- Code style rules
- **Rarely modify**: Only for style changes

### `vitest.config.ts`
- Test runner configuration
- Coverage settings
- **Rarely modify**: Only for test setup changes

## CI/CD Pipeline

GitHub Actions runs on every PR:
1. Lint check (`npm run lint`)
2. Format check (`npm run format:check`)
3. Build (`npm run build`)
4. Tests (`npm test`)
5. Coverage report (PR comments)

Matrix testing: Node.js 18, 20, 22

## Architecture Decisions

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support
- Self-documenting code

### Why Classes?
- Encapsulates state and behavior
- Clear lifecycle management
- Easy to extend

### Why MCP?
- Standard protocol for AI assistants
- Integrates with Claude Desktop
- Future-proof for other MCP clients

### Why Vitest?
- Fast test runner
- Modern ESM support
- Great TypeScript integration

## Useful Commands

```bash
# Development
npm run watch              # Auto-rebuild on changes
npm run dev                # Run server locally

# Testing
npm test                   # Run tests once
npm run test:watch         # Run tests in watch mode
npm run test:ui            # Open test UI
npm run test:coverage      # Generate coverage report

# Code Quality
npm run lint               # Check linting
npm run lint:fix           # Fix linting issues
npm run format             # Format all files
npm run format:check       # Check formatting
npm run check              # Run all checks

# Build
npm run build              # Compile TypeScript
npm run prepare            # Runs automatically on install
```

## Error Messages to Understand

- **"No active session"** → Must call `{method}_init` first
- **"Session ended"** → Limit reached, call `{method}_reset`
- **"Invalid parameter"** → Check parameter validation rules
- **"must be positive"** → Numeric parameter must be > 0

## References

- **Detailed Architecture**: `.docs/architecture.md` (Japanese)
- **Method Specifications**: `.docs/{method}.md` (Japanese)
- **Custom Commands**: `.claude/commands/` directory
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Vitest Docs**: https://vitest.dev/

## Project Philosophy

1. **Educational First**: Help users understand betting strategies
2. **Type Safety**: Prevent bugs through strong typing
3. **Testability**: Comprehensive test coverage
4. **Extensibility**: Easy to add new methods
5. **Maintainability**: Clear code structure and documentation

## Contributing

When contributing:
1. Follow existing patterns
2. Write tests for new code
3. Update documentation
4. Ensure all checks pass
5. Use descriptive commit messages

## Disclaimer

This is an educational tool. Betting strategies do not guarantee profits. Use at your own risk.
