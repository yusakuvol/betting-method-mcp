# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-13

### Added
- Initial release of betting-method-mcp
- **10 Betting Methods Implemented:**
  - Monte Carlo Method
  - Martingale Method
  - Labouchere (Cancellation System)
  - Oscar's Grind Method
  - Cocomo Method (3x payout Fibonacci progression)
  - Goodman Method (1-2-3-5 progression)
  - Fibonacci Method
  - Paroli System (Reverse Martingale)
  - D'Alembert Method
  - Fixed Percentage Betting (10% method)
- MCP (Model Context Protocol) server implementation
- Claude Desktop integration support
- TypeScript implementation with strict mode
- Comprehensive test suite (234+ tests across 10 test files)
- 80%+ test coverage
- Biome for linting and formatting
- Full type definitions
- Session management for each betting method
- State tracking (bets, profit, win/loss streaks)
- Error handling and validation

### Features
- Each method provides 4 MCP tools:
  - `{method}_init` - Initialize betting session
  - `{method}_record` - Record win/loss result
  - `{method}_status` - Get current session status
  - `{method}_reset` - Reset session to initial state
- Immutable state returns for safety
- Configurable parameters (base unit, limits, sequences, etc.)
- Educational disclaimer included

### Documentation
- Comprehensive README with usage examples
- Method-specific documentation in `.docs/` directory
- Architecture documentation
- CLAUDE.md for AI assistant context

[0.1.0]: https://github.com/yusakuvol/betting-method-mcp/releases/tag/v0.1.0
