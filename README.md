# Betting Method MCP Server

MCP (Model Context Protocol) サーバーで、各種ベッティング方法の計算を提供します。Claude DesktopやMCP対応アプリケーションから利用できます。

現在、**モンテカルロ法**と**マーチンゲール法**をサポートしています。今後、パーレー法、ダランベール法など他のベッティング方法も追加予定です。

## 機能

### モンテカルロ法 (Monte Carlo Method)

モンテカルロ法は、数列を使って賭け金を管理する戦略です。

**仕組み:**
1. 初期数列（例: `[1, 2, 3]`）を設定
2. 賭け金 = (最初の数 + 最後の数) × 基本単位
3. **勝った場合**: 数列の最初と最後の数を削除
4. **負けた場合**: 負けた賭け金（単位数）を数列の最後に追加
5. 数列が空または1つになったらセッション完了

**提供ツール:**
- `montecarlo_init` - 新しいセッションを初期化
- `montecarlo_record` - 勝敗を記録して次の賭け金を取得
- `montecarlo_status` - 現在の状態（数列、賭け金、収支）を確認
- `montecarlo_reset` - セッションをリセット

### マーチンゲール法 (Martingale Method)

マーチンゲール法は、負けるたびに賭け金を倍にする戦略です。勝てば初期賭け金分の利益が得られますが、連敗時のリスクが高い方法です。

**仕組み:**
1. 初期賭け金を設定
2. 賭け金 = 初期賭け金 × 2^(連敗回数)
3. **勝った場合**: 賭け金を初期値にリセット
4. **負けた場合**: 賭け金を2倍にする
5. 最大賭け金または最大連敗数に達したらセッション終了

**提供ツール:**
- `martingale_init` - 新しいセッションを初期化（基本賭け金、最大賭け金、最大連敗数を設定）
- `martingale_record` - 勝敗を記録して次の賭け金を取得
- `martingale_status` - 現在の状態（賭け金、連敗数、収支）を確認
- `martingale_reset` - セッションをリセット

**⚠️ 重要:** マーチンゲール法は連敗時に賭け金が指数関数的に増加します。必ず上限を設定し、リスク管理を徹底してください。

## セットアップ

```bash
git clone https://github.com/yusakuvol/betting-method-mcp.git
cd betting-method-mcp
npm install
npm run build
```

## 使用方法

### Claude Desktopでの設定

`claude_desktop_config.json` を編集:

```json
{
  "mcpServers": {
    "betting-method": {
      "command": "node",
      "args": ["/path/to/betting-method-mcp/build/index.js"]
    }
  }
}
```

### 使用例

Claude Desktopで以下のように質問できます:

#### モンテカルロ法
```
モンテカルロ法で基本単位10でセッションを開始して
```

```
勝ちを記録して次の賭け金を教えて
```

```
現在の状態を確認して
```

#### マーチンゲール法
```
マーチンゲール法で基本賭け金10、最大賭け金1000、最大連敗数7でセッションを開始して
```

```
負けを記録して
```

```
マーチンゲール法の状態を確認して
```

## 開発

### ビルド

```bash
npm run build
```

### 開発モード（watchモード）

```bash
npm run watch
```

### ローカルテスト

```bash
npm run dev
```

## プロジェクト構造

```
betting-method-mcp/
├── src/
│   ├── index.ts              # MCPサーバーエントリーポイント
│   ├── types.ts              # 共通型定義
│   └── methods/
│       ├── montecarlo.ts     # モンテカルロ法の実装
│       └── martingale.ts     # マーチンゲール法の実装
├── .dccs/                    # 各方法の詳細仕様
│   ├── architecture.md       # アーキテクチャ設計
│   └── martingale.md         # マーチンゲール法の詳細
├── build/                    # コンパイル後のファイル
├── package.json
├── tsconfig.json
└── README.md
```

## 将来の拡張予定

以下のベッティング方法の追加を予定しています:

- **パーレー法** (Paroli) - 勝ったら賭け金を倍にする（逆マーチンゲール）
- **ダランベール法** (D'Alembert) - 負けたら+1、勝ったら-1の緩やかな増減
- **ラブシェール法** (Labouchere) - より柔軟な数列ベース戦略
- **フィボナッチ法** (Fibonacci) - フィボナッチ数列を使った賭け金管理

## ライセンス

MIT

## 注意事項

このツールは教育・研究目的で提供されています。実際の賭博での使用は自己責任で行ってください。ベッティング戦略は必ずしも利益を保証するものではありません。
