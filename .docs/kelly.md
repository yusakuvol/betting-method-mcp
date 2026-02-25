# ケリー基準（Kelly Criterion）

## 概要

ケリー基準は、期待値がプラスの賭けにおいて、長期的な資金成長率を最大化する数学的に最適な賭け金を算出する手法です。勝率とオッズから最適な賭け割合を導き、フラクショナルケリーによるリスク調整や、実績に基づく動的な勝率補正にも対応します。

## 仕組み

### 基本ルール

1. **ケリー比率を算出**: `f* = (bp - q) / b`
2. **賭け金を計算**: `資金 * f* * フラクショナルケリー`
3. **勝った場合**: 資金に実際の配当を加算
4. **負けた場合**: 資金から賭け金を減算
5. **動的調整**: 30ゲーム以降、実際の勝率でケリー比率を再計算

### 計算式

```
f* = (b * p - q) / b    （b: オッズ-1、p: 勝率、q: 敗率）
賭け金 = 資金 * f* * fractionalKelly
例: 勝率55%、2倍配当 → f* = (1*0.55-0.45)/1 = 0.10 → 資金の10%
```

## パラメータ

### 必須パラメータ

- **initialBankroll** (初期資金): 開始時の総資金
- **winProbability** (勝率): 推定勝率（0〜1）
- **payoutOdds** (配当オッズ): 勝ち時の配当倍率（2倍配当なら `2`）

### オプションパラメータ

- **fractionalKelly** (フラクショナルケリー): ケリー比率の適用割合（デフォルト: `1.0`）
  - `0.5` でハーフケリー（推奨）
- **minBet** (最小賭け金): 賭け金の下限
- **maxBet** (最大賭け金): 賭け金の上限

## State定義

```typescript
interface KellyState {
  initialBankroll: number;    // 初期資金
  currentBankroll: number;    // 現在の資金
  winProbability: number;     // 推定勝率
  payoutOdds: number;         // 配当オッズ
  fractionalKelly: number;    // フラクショナルケリー係数
  kellyPercentage: number;    // 現在のケリー比率（%）
  currentBet: number;         // 現在の賭け金
  totalProfit: number;        // 累積損益
  actualWinRate: number;      // 実際の勝率
  totalWins: number;          // 総勝利数
  totalLosses: number;        // 総敗北数
  sessionActive: boolean;     // セッション状態
  roundCount: number;         // ラウンド数
}
```

## MCPツール

- **kelly_init** - セッション初期化
- **kelly_record** - 勝敗記録（`"win"` または `"loss"`、オプション: `actualPayout`）
- **kelly_status** - 現在の状態確認
- **kelly_reset** - セッションリセット

### kelly_record の特殊パラメータ

- **actualPayout** (実際の配当): 勝ち時の実際の配当倍率（デフォルト: `payoutOdds`）

## 注意事項

- フルケリーは変動が非常に大きいため、ハーフケリー（`fractionalKelly: 0.5`）を推奨
- 勝率の推定精度が結果に大きく影響する
- 30ゲーム以降の動的調整により、推定勝率と実績の乖離を自動補正する
- ケリー比率が負の場合は期待値がマイナスであり、賭けるべきでない
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
