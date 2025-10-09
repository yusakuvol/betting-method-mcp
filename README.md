# Betting Method MCP Server

MCP (Model Context Protocol) サーバーで、各種ベッティング方法の計算を提供します。Claude DesktopやMCP対応アプリケーションから利用できます。

現在、**モンテカルロ法**をサポートしています。今後、マーチンゲール法、パーレー法など他のベッティング方法も追加予定です。

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

## インストール

### npm経由（公開後）

```bash
npm install -g betting-method-mcp
```

### ローカル開発

```bash
git clone https://github.com/yourusername/betting-method-mcp.git
cd betting-method-mcp
npm install
npm run build
```

## 使用方法

### Claude Desktopでの設定

`claude_desktop_config.json` を編集:

**グローバルインストールの場合:**

```json
{
  "mcpServers": {
    "betting-method": {
      "command": "betting-method-mcp"
    }
  }
}
```

**ローカル開発の場合:**

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

```
モンテカルロ法で基本単位10でセッションを開始して
```

```
勝ちを記録して次の賭け金を教えて
```

```
現在の状態を確認して
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
│       └── montecarlo.ts     # モンテカルロ法の実装
├── build/                    # コンパイル後のファイル
├── package.json
├── tsconfig.json
└── README.md
```

## 将来の拡張予定

以下のベッティング方法の追加を予定しています:

- **マーチンゲール法** (Martingale) - 負けたら賭け金を倍にする
- **パーレー法** (Paroli) - 勝ったら賭け金を倍にする
- **ダランベール法** (D'Alembert) - 負けたら+1、勝ったら-1
- **ラブシェール法** (Labouchere) - より柔軟な数列ベース戦略

## ライセンス

MIT

## 注意事項

このツールは教育・研究目的で提供されています。実際の賭博での使用は自己責任で行ってください。ベッティング戦略は必ずしも利益を保証するものではありません。
