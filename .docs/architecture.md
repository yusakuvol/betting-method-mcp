# アーキテクチャ設計

## プロジェクト概要

`betting-method-mcp` は、Model Context Protocol (MCP) サーバーとして実装された、各種ベッティング方法の計算ツール群です。Claude DesktopなどのMCP対応クライアントから利用できます。

## 設計方針

### 拡張性の重視

- 新しいベッティング方法を簡単に追加できる構造
- 各メソッドは独立したクラスとして実装
- 共通インターフェースを定義

### 型安全性

- TypeScriptの型システムを最大限活用
- 各ベッティング方法に固有の状態型を定義
- 共通の基底インターフェースを継承

### シンプルなAPI

- MCPツールとして一貫した命名規則
- 初期化、記録、状態確認、リセットの4つの基本操作

## ディレクトリ構造

```
betting-method-mcp/
├── src/
│   ├── index.ts              # MCPサーバーのエントリーポイント
│   ├── types.ts              # 共通型定義
│   ├── helpers/              # MCPレスポンス・ツール定義ヘルパー
│   │   ├── mcp-response.ts   # レスポンス生成ユーティリティ
│   │   ├── statistics-handler.ts  # 統計レスポンスビルダー
│   │   └── tool-definitions.ts    # ツールスキーマファクトリ
│   ├── utils/
│   │   └── statistics.ts     # 統計計算ユーティリティ
│   └── methods/              # ベッティング方法の実装（11メソッド）
│       ├── montecarlo.ts     # モンテカルロ法
│       ├── martingale.ts     # マーチンゲール法
│       ├── labouchere.ts     # ラブシェール法
│       ├── oscarsgrind.ts    # オスカーズグラインド
│       ├── cocomo.ts         # ココモ法
│       ├── goodman.ts        # グッドマン法 (1-2-3-5)
│       ├── fibonacci.ts      # フィボナッチ法
│       ├── paroli.ts         # パーレー法
│       ├── dalembert.ts      # ダランベール法
│       ├── percentage.ts     # 固定パーセンテージ法
│       └── kelly.ts          # ケリー基準
├── .docs/                    # メソッド仕様書（日本語）
├── build/                    # TypeScriptコンパイル後のファイル
├── package.json
├── tsconfig.json
└── README.md
```

## 型定義の設計 (src/types.ts)

### 基本型

```typescript
// 勝敗の結果
export type BetResult = "win" | "loss";

// すべてのベッティング方法の基底インターフェース
export interface BettingMethodState {
  currentBet: number;        // 現在の賭け金
  totalProfit: number;       // 累積損益
  sessionActive: boolean;    // セッションがアクティブか
}
```

### 各メソッド固有の状態

各ベッティング方法は `BettingMethodState` を継承し、固有のプロパティを追加:

```typescript
// モンテカルロ法
export interface MonteCarloState extends BettingMethodState {
  sequence: number[];        // 数列
  baseUnit: number;          // 基本単位
}

// マーチンゲール法
export interface MartingaleState extends BettingMethodState {
  baseUnit: number;          // 初期賭け金
  currentStreak: number;     // 現在の連敗数
  maxBet: number;            // 最大賭け金
  maxLossStreak: number;     // 最大連敗数
  reachedLimit: boolean;     // 上限到達フラグ
}
```

## ベッティング方法クラスの実装パターン

各ベッティング方法は以下のパターンで実装します:

```typescript
export class [MethodName]Method {
  private state: [MethodName]State;

  constructor(/* 初期パラメータ */) {
    // 初期状態の設定
  }

  /**
   * セッションの初期化
   */
  initSession(/* パラメータ */): void {
    // セッションを初期化
  }

  /**
   * 勝敗を記録して状態を更新
   */
  recordResult(result: BetResult): void {
    // セッションがアクティブかチェック
    // 勝敗に応じて状態を更新
    // 次の賭け金を計算
  }

  /**
   * 現在の状態を取得
   */
  getState(): [MethodName]State {
    return { ...this.state };
  }

  /**
   * セッションをリセット
   */
  reset(): void {
    // 設定を保持したまま初期状態に戻す
  }
}
```

## MCPツールの命名規則

各ベッティング方法につき、4つのツールを提供:

### パターン: `{method}_{action}`

- `{method}_init` - セッションの初期化
- `{method}_record` - 勝敗の記録
- `{method}_status` - 状態の確認
- `{method}_reset` - セッションのリセット
- `{method}_statistics` - セッション統計の取得（一部メソッドのみ）

### 例

#### モンテカルロ法
- `montecarlo_init`
- `montecarlo_record`
- `montecarlo_status`
- `montecarlo_reset`

#### マーチンゲール法
- `martingale_init`
- `martingale_record`
- `martingale_status`
- `martingale_reset`

## MCPサーバーの実装 (src/index.ts)

### 構造

```typescript
// 1. 各メソッドのインスタンスを作成
const monteCarlo = new MonteCarloMethod();
const martingale = new MartingaleMethod();

// 2. MCPサーバーを初期化
const server = new Server({...});

// 3. ツール一覧を提供
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 各メソッドのツール定義
    ]
  };
});

// 4. ツール呼び出しを処理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (name) {
    case "montecarlo_init": { /* ... */ }
    case "martingale_init": { /* ... */ }
    // ...
  }
});
```

### レスポンス形式

すべてのツールは統一されたJSON形式で結果を返す:

```typescript
{
  message: "操作の説明",
  // メソッド固有の状態情報
  baseUnit: number,
  currentBet: number,
  totalProfit: number,
  sessionActive: boolean,
  // その他のプロパティ
}
```

## 新しいベッティング方法の追加手順

### 1. 仕様書の作成

`docs/{method}.md` に以下を記載:
- 概要と仕組み
- パラメータ仕様
- リスクとメリット
- 使用例

### 2. 型定義の追加

`src/types.ts` に状態インターフェースを追加:

```typescript
export interface [Method]State extends BettingMethodState {
  // 固有のプロパティ
}
```

### 3. クラスの実装

`src/methods/{method}.ts` を作成:
- コンストラクタ
- `initSession()`
- `recordResult()`
- `getState()`
- `reset()`

### 4. MCPサーバーへの統合

`src/index.ts` を更新:
- インスタンスの作成
- ツール定義の追加（4つ）
- ハンドラの実装（4つ）

### 5. ドキュメント更新

`README.md` に使用方法を追加

### 6. ビルドとテスト

```bash
npm run build
npm run dev  # 動作確認
```

## エラーハンドリング

### 統一されたエラー処理

すべてのツールで共通のエラーハンドリング:

```typescript
try {
  // ツールの処理
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ error: errorMessage }, null, 2)
    }],
    isError: true
  };
}
```

### よくあるエラー

- セッション未初期化: `"No active session. Please initialize a session first."`
- パラメータ不正: `"Invalid parameter: ..."`
- 上限到達: `"Session ended: reached limit"`

## 統計機能

一部のメソッド（montecarlo, martingale, labouchere, oscarsgrind）には統計レポート機能が実装されています:

- 基本統計: 勝率、ROI、純利益
- ストリーク: 現在の連勝/連敗、最大連勝/連敗
- 財務指標: 総賭け金、総リターン
- ベット分析: 平均/最小/最大ベット
- リスク指標: ボラティリティ、シャープレシオ

統計ユーティリティは `src/utils/statistics.ts` に実装され、`src/helpers/statistics-handler.ts` がMCPレスポンスを生成します。

## 将来の拡張

### 機能拡張の可能性

- 全メソッドへの統計機能追加
- シミュレーション: ランダムな結果で長期的な成績を予測
- グラフ出力: 収支の推移を可視化
- カスタムルール: ユーザー定義の戦略

## セキュリティとベストプラクティス

### 状態の不変性

`getState()` は常にコピーを返す:

```typescript
getState(): State {
  return { ...this.state };
}
```

### パラメータ検証

すべての入力パラメータを検証:

```typescript
if (baseUnit <= 0) {
  throw new Error("baseUnit must be positive");
}
```

### 型安全性

TypeScriptの厳格モードを使用:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## テストとデバッグ

### 開発時の確認

```bash
# ビルド
npm run build

# watchモード
npm run watch

# ローカルテスト
npm run dev
```

### Claude Desktopでのテスト

1. `claude_desktop_config.json` を設定
2. Claude Desktopを再起動
3. 各ツールの動作確認

## まとめ

このアーキテクチャにより:

✅ 新しいベッティング方法を簡単に追加できる
✅ 各メソッドが独立して動作する
✅ 型安全性が保証される
✅ 一貫したAPIを提供できる
✅ 保守性と拡張性が高い
