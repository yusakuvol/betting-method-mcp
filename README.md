# Betting Method MCP Server

![CI](https://github.com/yusakuvol/betting-method-mcp/actions/workflows/ci.yml/badge.svg)
[![npm version](https://badge.fury.io/js/betting-method-mcp.svg)](https://www.npmjs.com/package/betting-method-mcp)
![Dependabot](https://img.shields.io/badge/Dependabot-enabled-success)

An MCP (Model Context Protocol) server that provides calculations for various betting methods. Can be used with Claude Desktop and other MCP-compatible applications.

**✨ Now supports 11 betting methods!**

## 🎲 Supported Betting Methods

- **Monte Carlo Method** - Sequence-based betting strategy
- **Martingale Method** - Double on loss (high risk)
- **Labouchere (Cancellation System)** - Flexible sequence strategy
- **Oscar's Grind** - Conservative profit-targeting system
- **Cocomo Method** - 3x payout Fibonacci progression
- **Goodman (1-2-3-5)** - Fixed progression system
- **Fibonacci Method** - Fibonacci sequence betting
- **Paroli System** - Reverse Martingale (double on wins)
- **D'Alembert Method** - Gradual increase/decrease
- **Fixed Percentage Betting** - Bankroll percentage strategy (e.g., 10% method)
- **Kelly Criterion** - Mathematically optimal bet sizing for long-term growth

## 📦 Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g betting-method-mcp
```

### Option 2: Use with npx (No installation needed)

```bash
npx betting-method-mcp
```

### Option 3: Install from GitHub

```bash
git clone https://github.com/yusakuvol/betting-method-mcp.git
cd betting-method-mcp
npm install
npm run build
```

## 🚀 Usage

### Claude Desktop Configuration

Edit your `claude_desktop_config.json`:

**If installed via npm:**
```json
{
  "mcpServers": {
    "betting-method": {
      "command": "betting-method-mcp"
    }
  }
}
```

**If using npx:**
```json
{
  "mcpServers": {
    "betting-method": {
      "command": "npx",
      "args": ["betting-method-mcp"]
    }
  }
}
```

**If installed from GitHub:**
```json
{
  "mcpServers": {
    "betting-method": {
      "command": "node",
      "args": ["/path/to/betting-method-mcp/build/index.js"]
    }
  }
}
```

### Usage Examples

You can ask Claude Desktop questions like these:

```
Start a Monte Carlo session with base unit 10
```

```
Initialize Martingale with base bet 10, max bet 1000
```

```
Start a Fibonacci betting session with base unit 5
```

```
Record a win and tell me the next bet amount
```

```
Check the current status
```

## 🎯 Available Tools

Each betting method provides 4 MCP tools:
- `{method}_init` - Initialize a new betting session
- `{method}_record` - Record a win/loss and get the next bet amount
- `{method}_status` - Check current state (bet amount, profit/loss, etc.)
- `{method}_reset` - Reset the session to initial state

### Method Names
- `montecarlo` - Monte Carlo Method
- `martingale` - Martingale Method
- `labouchere` - Labouchere (Cancellation System)
- `oscarsgrind` - Oscar's Grind
- `cocomo` - Cocomo Method
- `goodman` - Goodman (1-2-3-5)
- `fibonacci` - Fibonacci Method
- `paroli` - Paroli System
- `dalembert` - D'Alembert Method
- `percentage` - Fixed Percentage Betting
- `kelly` - Kelly Criterion

## 📖 Method Details

### Monte Carlo Method

Sequence-based betting strategy that manages bet amounts using a number sequence.

**How it works:**
1. Set an initial sequence (e.g., `[1, 2, 3]`)
2. Bet amount = (first number + last number) × base unit
3. **On win**: Remove first and last numbers from the sequence
4. **On loss**: Add the lost bet amount (in units) to the end of the sequence
5. Session completes when the sequence has 0 or 1 numbers

### Martingale Method

Doubles the bet amount after each loss. High risk strategy.

**⚠️ Warning:** Bet amounts increase exponentially during losing streaks. Always set limits!

### Labouchere (Cancellation System)

Flexible sequence-based strategy where you can set your target profit.

### Oscar's Grind

Conservative system that increases bets only after wins, targeting small consistent profits.

### Cocomo Method

Fibonacci-style progression designed for 3x payout games.

### Goodman (1-2-3-5)

Fixed progression system: 1 → 2 → 3 → 5 units on consecutive wins.

### Fibonacci Method

Uses the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13...) to determine bet amounts.

### Paroli System (Reverse Martingale)

Doubles bet on wins instead of losses. Less risky than Martingale.

### D'Alembert Method

Gradual progression: +1 unit on loss, -1 unit on win.

### Fixed Percentage Betting

Bet a fixed percentage of your bankroll (e.g., 10% of current bankroll).

### Kelly Criterion

Mathematically optimal betting strategy that calculates the ideal bet size to maximize long-term bankroll growth.

**How it works:**
1. Formula: `f* = (bp - q) / b`
   - `f*` = optimal bet fraction (percentage of bankroll)
   - `b` = payout odds (profit multiplier)
   - `p` = win probability
   - `q` = loss probability (1 - p)
2. **Fractional Kelly**: Use a fraction (0.25, 0.5, etc.) of full Kelly to reduce volatility
3. **Dynamic adjustment**: After 30+ games, uses actual win rate instead of estimated probability
4. Automatically adjusts bet size based on current bankroll and performance

**⚠️ Note:** Full Kelly (1.0) can be very volatile. Half Kelly (0.5) or Quarter Kelly (0.25) are recommended for practical use.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/betting-method-mcp.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes and add tests
6. Ensure all checks pass: `npm run build && npm test && npm run check`
7. Commit following [Conventional Commits](https://www.conventionalcommits.org/)
8. Push and create a Pull Request

### Issue Templates

When reporting issues or suggesting features, please use the appropriate template:

- **Bug Report**: For reporting bugs or unexpected behavior
- **Feature Request**: For suggesting new features or improvements
- **Betting Method**: For proposing new betting strategies

See our [Issue Templates](.github/ISSUE_TEMPLATE/) for more details.

## 🛠️ Development

### Build

```bash
npm run build
```

### Development Mode (watch mode)

```bash
npm run watch
```

### Local Testing

```bash
npm run dev
```

### Testing

This project uses Vitest for testing with 276+ tests across 11 test files.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Code Quality

This project uses Biome for linting and formatting.

```bash
# Lint check
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run all checks (lint + format)
npm run check
```

## 🤖 AI-Assisted Development

This project includes context files for various AI coding assistants:

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive context for Claude AI assistants
- **[AGENT.md](AGENT.md)** - General context for any AI agent
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - GitHub Copilot instructions
- **[.cursorrules](.cursorrules)** - Cursor AI rules

### Claude Code Custom Command

This project includes a custom `/implement` command for automatically implementing new betting methods based on GitHub issues.

**Usage:**
```
/implement <issue_number>
```

This will automatically:
1. Fetch the issue details from GitHub
2. Generate the method implementation
3. Add the State interface
4. Register MCP tools
5. Create comprehensive tests
6. Build and run tests

## 📁 Project Structure

```
betting-method-mcp/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── types.ts                    # Common type definitions
│   └── methods/
│       ├── __tests__/              # Vitest test files (11 files)
│       ├── montecarlo.ts
│       ├── martingale.ts
│       ├── labouchere.ts
│       ├── oscarsgrind.ts
│       ├── cocomo.ts
│       ├── goodman.ts
│       ├── fibonacci.ts
│       ├── paroli.ts
│       ├── dalembert.ts
│       ├── percentage.ts
│       └── kelly.ts
├── .docs/                          # Method specifications (Japanese)
├── build/                          # Compiled files
└── ...
```

## 📄 License

MIT

## ⚠️ Disclaimer

This tool is provided for **educational and research purposes only**. Use in actual gambling is at your own risk. Betting strategies do not guarantee profits. Please gamble responsibly.
