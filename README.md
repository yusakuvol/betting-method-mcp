# Betting Method MCP Server

An MCP (Model Context Protocol) server that provides calculations for various betting methods. Can be used with Claude Desktop and other MCP-compatible applications.

Currently supports **Monte Carlo Method** and **Martingale Method**. Additional betting methods such as Paroli, D'Alembert, and others are planned for future releases.

## Features

### Monte Carlo Method

The Monte Carlo method is a betting strategy that manages bet amounts using a number sequence.

**How it works:**
1. Set an initial sequence (e.g., `[1, 2, 3]`)
2. Bet amount = (first number + last number) × base unit
3. **On win**: Remove first and last numbers from the sequence
4. **On loss**: Add the lost bet amount (in units) to the end of the sequence
5. Session completes when the sequence has 0 or 1 numbers

**Available tools:**
- `montecarlo_init` - Initialize a new session
- `montecarlo_record` - Record a win/loss and get the next bet amount
- `montecarlo_status` - Check current state (sequence, bet amount, profit/loss)
- `montecarlo_reset` - Reset the session

### Martingale Method

The Martingale method is a strategy that doubles the bet amount after each loss. When you win, you recover all previous losses plus gain a profit equal to the initial bet amount, but this method carries high risk during losing streaks.

**How it works:**
1. Set an initial bet amount
2. Bet amount = initial bet × 2^(consecutive losses)
3. **On win**: Reset bet amount to initial value
4. **On loss**: Double the bet amount
5. Session ends when maximum bet or maximum loss streak is reached

**Available tools:**
- `martingale_init` - Initialize a new session (set base bet, max bet, max loss streak)
- `martingale_record` - Record a win/loss and get the next bet amount
- `martingale_status` - Check current state (bet amount, loss streak, profit/loss)
- `martingale_reset` - Reset the session

**⚠️ Important:** The Martingale method causes bet amounts to increase exponentially during losing streaks. Always set limits and practice strict risk management.

## Setup

```bash
git clone https://github.com/yusakuvol/betting-method-mcp.git
cd betting-method-mcp
npm install
npm run build
```

## Usage

### Claude Desktop Configuration

Edit `claude_desktop_config.json`:

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

#### Monte Carlo Method
```
Start a Monte Carlo session with base unit 10
```

```
Record a win and tell me the next bet amount
```

```
Check the current status
```

#### Martingale Method
```
Start a Martingale session with base bet 10, max bet 1000, and max loss streak 7
```

```
Record a loss
```

```
Check the Martingale status
```

## Development

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

## Project Structure

```
betting-method-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── types.ts              # Common type definitions
│   └── methods/
│       ├── montecarlo.ts     # Monte Carlo method implementation
│       └── martingale.ts     # Martingale method implementation
├── .dccs/                    # Detailed specifications for each method (Japanese)
│   ├── architecture.md       # Architecture design
│   └── martingale.md         # Martingale method details
├── build/                    # Compiled files
├── package.json
├── tsconfig.json
└── README.md
```

## Future Enhancements

The following betting methods are planned for addition:

- **Paroli System** - Double bet on wins (reverse Martingale)
- **D'Alembert System** - Gradual increase/decrease (+1 on loss, -1 on win)
- **Labouchere System** - More flexible sequence-based strategy
- **Fibonacci System** - Bet management using Fibonacci sequence

## License

MIT

## Disclaimer

This tool is provided for educational and research purposes. Use in actual gambling is at your own risk. Betting strategies do not guarantee profits.
