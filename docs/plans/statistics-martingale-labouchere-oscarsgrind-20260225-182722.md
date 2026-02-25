# Implementation Plan: Statistics for Martingale, Labouchere, Oscar's Grind

- **Issue**: #60
- **Title**: 統計レポート機能: Martingale, Labouchere, Oscar's Grindメソッドに追加
- **Start Time**: 2026-02-25 18:27:22

## Overview

Add statistics reporting functionality (already implemented in Monte Carlo method) to:
1. Martingale Method
2. Labouchere Method
3. Oscar's Grind Method

## Reference

- Monte Carlo implementation: `src/methods/montecarlo.ts`
- Statistics utilities: `src/utils/statistics.ts`

## Implementation Steps

### 1. Modify Method Classes
For each of the 3 methods:
- [x] Import statistics utilities (`initializeStatistics`, `updateStatistics`, `calculateRiskMetrics`)
- [x] Add `statistics` initialization in `initSession()`
- [x] Add statistics update in `recordResult()`
- [x] Add `getStatistics()` method
- [x] Ensure `reset()` also resets statistics

### 2. Register MCP Tools (`src/index.ts`)
- [x] Add `martingale_statistics` tool definition and handler
- [x] Add `labouchere_statistics` tool definition and handler
- [x] Add `oscarsgrind_statistics` tool definition and handler

### 3. Add Tests
- [x] Add statistics tests to `martingale.test.ts`
- [x] Add statistics tests to `labouchere.test.ts`
- [x] Add statistics tests to `oscarsgrind.test.ts`

### Files Modified
- `src/methods/martingale.ts`
- `src/methods/labouchere.ts`
- `src/methods/oscarsgrind.ts`
- `src/index.ts`
- `src/methods/__tests__/martingale.test.ts`
- `src/methods/__tests__/labouchere.test.ts`
- `src/methods/__tests__/oscarsgrind.test.ts`

## CI Results

- [x] `npm run lint` → ✅ PASS (warnings only, pre-existing)
- [x] `npm run format:check` → ✅ PASS
- [x] `npm run build` → ✅ PASS
- [x] `npm test` → ✅ PASS (363 tests, 12 test files)
- [x] `npm run test:coverage` → ✅ PASS (100% statements, branches, functions, lines)

## Completion

- **End Time**: 2026-02-25 18:35:00
- **Duration**: ~8 minutes
