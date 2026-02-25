# ダランベール法（D'Alembert Method）

## 概要

ダランベール法は、緩やかな累進戦略です。負けたら賭け金を1単位増やし、勝ったら1単位減らします。マーチンゲール法と比べて賭け金の変動が小さく、リスクを抑えた長期戦向きの手法です。

## 仕組み

### 基本ルール

1. **初回**: `baseUnit` を賭ける
2. **負けた場合**: 賭け金を `baseUnit` 分だけ増やす
3. **勝った場合**: 賭け金を `baseUnit` 分だけ減らす（最小は `baseUnit`）
4. **終了条件**: 賭け金が `maxBet` を超えた場合

### 計算式

```
負け後の賭け金 = currentBet + baseUnit
勝ち後の賭け金 = max(currentBet - baseUnit, baseUnit)
```

### 例（baseUnit = 10）

| ラウンド | 賭け金 | 結果 | 累積損益 |
|---------|--------|------|---------|
| 1       | 10     | 負け | -10     |
| 2       | 20     | 負け | -30     |
| 3       | 30     | 勝ち | 0       |
| 4       | 20     | 勝ち | +20     |
| 5       | 10     | 負け | +10     |

## パラメータ

### 必須パラメータ

- **baseUnit** (基本賭け金単位): 1単位あたりの金額

### オプションパラメータ

- **maxBet** (最大賭け金): 賭け金の上限（デフォルト: `baseUnit * 100`）

## State定義

```typescript
interface DalembertState {
  baseUnit: number;           // 基本賭け金単位
  currentBet: number;         // 現在の賭け金
  maxBet: number;             // 最大賭け金
  totalProfit: number;        // 累積損益
  sessionActive: boolean;     // セッション状態
  reachedLimit: boolean;      // 上限到達フラグ
  roundCount: number;         // ラウンド数
}
```

## MCPツール

- **dalembert_init** - セッション初期化
- **dalembert_record** - 勝敗記録（`"win"` または `"loss"`）
- **dalembert_status** - 現在の状態確認
- **dalembert_reset** - セッションリセット

## 注意事項

- 勝ちと負けが同数の場合、勝ち数分の利益が出る
- マーチンゲール法より安全だが、損失回復に時間がかかる
- 長い連敗時でも賭け金の増加は線形であるため資金管理がしやすい
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
