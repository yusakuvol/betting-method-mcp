# ラブシェール法（Labouchere Method）

## 概要

ラブシェール法は、目標利益を数列に分割し、その数列を操作しながら賭け金を決定する柔軟な戦略です。キャンセレーションシステムとも呼ばれ、プレイヤーが目標利益と初期数列を自由に設定できる点が特徴です。

## 仕組み

### 基本ルール

1. **目標利益を設定**: 数列の合計が目標利益になるように分割
2. **賭け金の計算**: `(数列の最初 + 数列の最後) * baseUnit`
   - 数列が1要素の場合: `その数 * baseUnit`
3. **勝った場合**: 数列の最初と最後の要素を削除
4. **負けた場合**: 賭けた単位数を数列の末尾に追加
5. **終了条件**: 数列が空になったら目標利益達成

### 計算式

```
賭け金 = (sequence[0] + sequence[sequence.length - 1]) * baseUnit
```

### 例（初期数列 [1, 2, 3, 2, 1]、目標利益 = 9）

| ラウンド | 数列           | 賭け金     | 結果 |
|---------|---------------|-----------|------|
| 1       | [1, 2, 3, 2, 1] | 2 * base | 勝ち |
| 2       | [2, 3, 2]     | 4 * base  | 負け |
| 3       | [2, 3, 2, 4]  | 6 * base  | 勝ち |
| 4       | [3, 2]        | 5 * base  | 勝ち |
| 5       | (空)           | -         | 完了 |

## パラメータ

### 必須パラメータ

- **baseUnit** (基本賭け金単位): 1単位あたりの金額
- **targetProfit** (目標利益): 達成すべき利益単位数

### オプションパラメータ

- **initialSequence** (初期数列): カスタム数列（デフォルト: 自動生成）
- **maxSequenceLength** (最大数列長): 数列の上限長（デフォルト: `25`）

## State定義

```typescript
interface LabouchereState {
  baseUnit: number;             // 基本賭け金単位
  targetProfit: number;         // 目標利益
  sequence: number[];           // 現在の数列
  currentBet: number;           // 現在の賭け金
  totalProfit: number;          // 累積損益
  maxSequenceLength: number;    // 最大数列長
  sessionActive: boolean;       // セッション状態
  sessionComplete: boolean;     // セッション完了フラグ
  reachedLimit: boolean;        // 上限到達フラグ
}
```

## MCPツール

- **labouchere_init** - セッション初期化
- **labouchere_record** - 勝敗記録（`"win"` または `"loss"`）
- **labouchere_status** - 現在の状態確認
- **labouchere_reset** - セッションリセット
- **labouchere_statistics** - 統計レポート表示

## 注意事項

- 連敗が続くと数列が急速に長くなり、賭け金が増大する
- `maxSequenceLength` を設定して数列の暴走を防止すること
- 目標利益の設定が大きすぎるとリスクが高まる
- 教育・研究目的のツールであり、実際の賭博での利益を保証しない
