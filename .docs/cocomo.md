# ココモ法（Cocomo Method）

## 概要

ココモ法は、フィボナッチ数列に似た累進賭け方式で、主に3倍配当のゲームに適した戦略です。負けた場合に前回と前々回の賭け金の合計を次の賭け金とします。1回の勝ちでそれまでの損失を回収できる可能性があります。

## 仕組み

### 基本ルール

1. **初回と2回目**: `baseUnit` を賭ける
2. **負けた場合**: `前々回の賭け金 + 前回の賭け金` を次に賭ける
3. **勝った場合**: 賭け金を `baseUnit` にリセットし、連敗カウントをリセット
4. **配当倍率**: 3倍配当を前提（カスタマイズ可能）

### 計算式

```
n回目の賭け金 = bet(n-2) + bet(n-1)
勝ち時の収益 = currentBet * payoutMultiplier - currentBet
```

### 例（baseUnit = 10、3倍配当）

| ラウンド | 賭け金 | 結果 | 収益   | 累積損益 |
|---------|--------|------|--------|---------|
| 1       | 10     | 負け | -10    | -10     |
| 2       | 10     | 負け | -10    | -20     |
| 3       | 20     | 負け | -20    | -40     |
| 4       | 30     | 負け | -30    | -70     |
| 5       | 50     | 勝ち | +100   | +30     |

## パラメータ

### 必須パラメータ

- **baseUnit** (基本賭け金単位): 1単位あたりの金額

### オプションパラメータ

- **maxBet** (最大賭け金): 賭け金の上限（デフォルト: `baseUnit * 1000`）

## State定義

```typescript
interface CocomoState {
  baseUnit: number;           // 基本賭け金単位
  currentBet: number;         // 現在の賭け金
  previousBet: number;        // 前回の賭け金
  currentStreak: number;      // 現在の連敗数
  maxBet: number;             // 最大賭け金
  payoutMultiplier: number;   // 配当倍率
  totalProfit: number;        // 累積損益
  sessionActive: boolean;     // セッション状態
  reachedLimit: boolean;      // 上限到達フラグ
}
```

## MCPツール

- **cocomo_init** - セッション初期化
- **cocomo_record** - 勝敗記録（`"win"` または `"loss"`）
- **cocomo_status** - 現在の状態確認
- **cocomo_reset** - セッションリセット

## 注意事項

- 3倍配当ゲーム専用に設計されており、2倍配当では損失回収が困難
- 連敗が続くと賭け金がフィボナッチ的に増大する
- `maxBet` を設定して資金管理を行うこと
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
