# 固定パーセンテージ法（Fixed Percentage Method）

## 概要

固定パーセンテージ法は、現在の資金（バンクロール）に対して一定の割合を賭ける資金管理戦略です。勝てば賭け金が増え、負ければ賭け金が減るため、資金の急激な枯渇を防ぎつつ、複利効果で利益を伸ばせます。

## 仕組み

### 基本ルール

1. **初期資金を設定**: 例えば10,000ドル
2. **賭け率を設定**: 例えば5%
3. **毎回の賭け金**: `現在の資金 * 賭け率`
4. **勝った場合**: 資金に賭け金を加算、次の賭け金も増加
5. **負けた場合**: 資金から賭け金を減算、次の賭け金も減少

### 計算式

```
賭け金 = max(currentBankroll * betPercentage / 100, minBet)
```

### 例（初期資金 = 10,000、賭け率 = 5%）

| ラウンド | 資金     | 賭け金 | 結果 | 新資金    |
|---------|---------|--------|------|----------|
| 1       | 10,000  | 500    | 勝ち | 10,500   |
| 2       | 10,500  | 525    | 負け | 9,975    |
| 3       | 9,975   | 499    | 勝ち | 10,474   |
| 4       | 10,474  | 524    | 負け | 9,950    |

## パラメータ

### 必須パラメータ

- **initialBankroll** (初期資金): 開始時の総資金
- **betPercentage** (賭け率): 資金に対する賭け金の割合（%）
- **minBet** (最小賭け金): 賭け金の下限

## State定義

```typescript
interface PercentageState {
  initialBankroll: number;    // 初期資金
  currentBankroll: number;    // 現在の資金
  betPercentage: number;      // 賭け率（%）
  minBet: number;             // 最小賭け金
  currentBet: number;         // 現在の賭け金
  totalProfit: number;        // 累積損益
  profitPercentage: number;   // 利益率（%）
  totalWins: number;          // 総勝利数
  totalLosses: number;        // 総敗北数
  sessionActive: boolean;     // セッション状態
  roundCount: number;         // ラウンド数
}
```

## MCPツール

- **percentage_init** - セッション初期化
- **percentage_record** - 勝敗記録（`"win"` または `"loss"`）
- **percentage_status** - 現在の状態確認
- **percentage_reset** - セッションリセット

## 注意事項

- 理論上は資金がゼロになることはないが、最小賭け金を下回る可能性がある
- 賭け率が高すぎると変動が激しくなり、低すぎると利益が出にくい
- 一般的に賭け率は1〜5%が推奨される
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
