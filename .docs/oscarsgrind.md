# オスカーズグラインド法（Oscar's Grind Method）

## 概要

オスカーズグラインドは、1セッションで1単位の利益を目指す保守的な戦略です。負けた後は賭け金を維持し、勝った後にのみ賭け金を1単位増やします。リスクを抑えながら着実に利益を積み上げる手法です。

## 仕組み

### 基本ルール

1. **1単位から開始**: `currentBet = baseUnit`
2. **負けた場合**: 賭け金を変更しない（そのまま維持）
3. **勝った場合**: 賭け金を1単位増やす
   - ただし、次の勝ちで目標利益を超える場合は調整する
4. **終了条件**: セッションの累積利益が目標利益単位に達したら完了

### 計算式

```
勝ち後の賭け金 = min(currentBet + baseUnit, 目標到達に必要な額)
負け後の賭け金 = currentBet（変更なし）
```

### 例（baseUnit = 10、目標 = 1単位利益）

| ラウンド | 賭け金 | 結果 | 累積損益 |
|---------|--------|------|---------|
| 1       | 10     | 負け | -10     |
| 2       | 10     | 負け | -20     |
| 3       | 10     | 勝ち | -10     |
| 4       | 20     | 勝ち | +10     |
| 完了     | -      | -    | +10     |

## パラメータ

### 必須パラメータ

- **baseUnit** (基本賭け金単位): 1単位あたりの金額

### オプションパラメータ

- **targetProfitUnits** (目標利益単位数): セッション完了の目標（デフォルト: `1`）
- **maxBetUnits** (最大賭け金単位数): 賭け金の上限（デフォルト: `10`）

## State定義

```typescript
interface OscarsGrindState {
  baseUnit: number;           // 基本賭け金単位
  currentBet: number;         // 現在の賭け金
  targetProfitUnits: number;  // 目標利益単位数
  maxBetUnits: number;        // 最大賭け金単位数
  sessionProfit: number;      // セッション内利益
  totalProfit: number;        // 累積損益
  sessionActive: boolean;     // セッション状態
  sessionComplete: boolean;   // セッション完了フラグ
  roundCount: number;         // ラウンド数
}
```

## MCPツール

- **oscarsgrind_init** - セッション初期化
- **oscarsgrind_record** - 勝敗記録（`"win"` または `"loss"`）
- **oscarsgrind_status** - 現在の状態確認
- **oscarsgrind_reset** - セッションリセット
- **oscarsgrind_statistics** - 統計レポート表示

## 注意事項

- 長い連敗後は回復に多くのラウンドを要する場合がある
- 保守的な戦略だが、損失が蓄積するリスクは残る
- `maxBetUnits` を設定して過度な賭け金増加を防止すること
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
