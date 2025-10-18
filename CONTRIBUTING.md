# Contributing to betting-method-mcp

Thank you for your interest in contributing to betting-method-mcp! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js >= 18
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yusakuvol/betting-method-mcp.git
cd betting-method-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Development Workflow

### Pre-commit Hooks

This project uses **husky** and **lint-staged** for automated pre-commit checks. Every time you commit, the following will run automatically:

1. **Lint**: Checks TypeScript files for code quality issues
2. **Format**: Auto-formats all staged files (TypeScript, JSON, Markdown, YAML)

If any issues are found, the commit will be blocked until you fix them.

### Bypassing Hooks (Emergency Only)

In rare cases where you need to skip the pre-commit hooks:

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Not recommended** - Use only when absolutely necessary.

### Code Quality Commands

```bash
# Lint check
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting (without changing files)
npm run format:check

# Run both lint and format checks
npm run check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Code Style

### TypeScript Guidelines
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

## Adding a New Betting Method

### Step-by-Step Guide

1. **Define State Interface** (in `src/types.ts`)
```typescript
export interface YourMethodState extends BettingMethodState {
  // Add method-specific properties
  baseUnit: number;
  // ... other properties
}
```

2. **Implement Method Class** (in `src/methods/yourmethod.ts`)
```typescript
export class YourMethod {
  private state: YourMethodState;

  initSession(/* params */): void { }
  recordResult(result: BetResult): void { }
  getState(): YourMethodState {
    return { ...this.state }; // Always return a copy
  }
  reset(): void { }
}
```

3. **Register MCP Tools** (in `src/index.ts`)
- Import your method
- Create an instance
- Add 4 tool definitions: `_init`, `_record`, `_status`, `_reset`
- Implement handlers

4. **Write Tests** (in `src/methods/__tests__/yourmethod.test.ts`)
- Aim for 80%+ coverage
- Test all edge cases
- Test error conditions

5. **Update Documentation**
- Add method description to README.md
- Create specification in `.dccs/yourmethod.md` (optional, Japanese)

### Using the `/implement` Command

This project includes a custom Claude Code command for automated implementation:

```
/implement <issue_number>
```

This will automatically generate the full implementation based on a GitHub issue.

## Commit Message Guidelines

This project follows **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process, CI, or other non-code changes

### Examples

```bash
git commit -m "feat: Add Kelly Criterion betting method"
git commit -m "fix: Correct Martingale progression calculation"
git commit -m "docs: Update README with new installation options"
git commit -m "test: Add edge cases for Monte Carlo method"
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Ensure all checks pass**
   ```bash
   npm run build  # TypeScript compilation
   npm test       # All tests pass
   npm run check  # Lint and format checks
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

6. **Wait for CI checks**
   - All tests must pass
   - Code coverage should not decrease
   - Lint/format checks must pass

7. **Address review feedback**
   - Make requested changes
   - Push additional commits

## Issue Templates

When creating issues, please use the appropriate template:

- **Bug Report** ([bug_report.yml](.github/ISSUE_TEMPLATE/bug_report.yml)): For reporting bugs or unexpected behavior
  - 問題の説明、再現手順、期待される動作など
  - 該当するベッティングメソッドを選択
  - エラーログや環境情報を提供

- **Feature Request** ([feature_request.yml](.github/ISSUE_TEMPLATE/feature_request.yml)): For suggesting new features or improvements
  - 解決したい課題や提案する機能
  - カテゴリと優先度の選択
  - 代替案や追加情報

- **Betting Method** ([betting_method.yml](.github/ISSUE_TEMPLATE/betting_method.yml)): For proposing new betting strategies
  - メソッド名と説明
  - ルール・計算式の詳細
  - リスクレベルと実装の複雑さ
  - 参考資料やユースケース

その他の質問や議論は [Discussions](https://github.com/yusakuvol/betting-method-mcp/discussions) をご利用ください。

## Project Structure

```
betting-method-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── types.ts              # Shared type definitions
│   └── methods/
│       ├── {method}.ts       # Method implementation
│       └── __tests__/
│           └── {method}.test.ts  # Tests
├── .github/
│   ├── workflows/            # CI/CD workflows
│   ├── dependabot.yml        # Dependency updates
│   └── ISSUE_TEMPLATE/       # Issue templates
├── .husky/                   # Git hooks
│   └── pre-commit            # Pre-commit hook
└── ...
```

## Resources

- **Architecture**: See [CLAUDE.md](CLAUDE.md) for detailed project context
- **Method Specs**: See `.dccs/*.md` files for method specifications (Japanese)
- **MCP Documentation**: https://modelcontextprotocol.io/

## Questions?

- Open a [Discussion](https://github.com/yusakuvol/betting-method-mcp/discussions) for questions
- Check existing [Issues](https://github.com/yusakuvol/betting-method-mcp/issues)
- Review the [README](README.md) for basic usage

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
