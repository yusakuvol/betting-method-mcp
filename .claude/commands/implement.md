---
description: GitHub Issueの番号を指定してベッティングメソッドを自動実装します
args:
  - name: issue_number
    description: 実装するGitHub Issueの番号
    required: true
---

# ベッティングメソッドの自動実装

指定されたGitHub Issue番号に基づいて、ベッティングメソッドを自動実装します。

## 実装手順

1. **Issue情報の取得**
   - `gh issue view {{issue_number}} --json title,body` でissue詳細を取得
   - タイトルとbodyから以下の情報を抽出:
     - メソッド名（例: dalembert, paroli, fibonacci, etc.）
     - State定義（TypeScript interface）
     - アルゴリズムの詳細

2. **ファイルの自動生成**

   以下のファイルを順番に生成してください:

   ### a. State定義の追加 (`src/types.ts`)
   - issueのState定義セクションから interface を抽出
   - `BettingMethodState` を継承する形で追加
   - 既存の型定義との整合性を確認

   ### b. メソッドクラスの実装 (`src/methods/{method}.ts`)
   - 以下のメソッドを実装:
     - `constructor()` - デフォルト値で初期化
     - `initSession()` - セッション初期化
     - `recordResult(result: BetResult)` - 勝敗記録と状態更新
     - `getState()` - 現在の状態取得（コピーを返す）
     - `reset()` - セッションリセット
   - issueのアルゴリズムセクションに基づいてロジックを実装
   - 既存実装（montecarlo.ts, martingale.ts）を参考にする

   ### c. MCPツールの登録 (`src/index.ts`)
   - メソッドのインスタンスを作成
   - ListToolsRequestSchema に4つのツールを追加:
     - `{method}_init` - セッション初期化
     - `{method}_record` - 勝敗記録
     - `{method}_status` - 状態確認
     - `{method}_reset` - リセット
   - CallToolRequestSchema に4つのハンドラを実装
   - エラーハンドリングを適切に実装

   ### d. テストファイルの作成 (`src/methods/__tests__/{method}.test.ts`)
   - Vitestを使用したユニットテストを作成
   - 以下のテストケースを含める:
     - `initSession` - 初期化のテスト
     - `recordResult - win` - 勝利時の動作
     - `recordResult - loss` - 敗北時の動作
     - `recordResult - mixed results` - 混合パターン
     - `getState` - 状態取得のテスト（イミュータブルの確認）
     - `reset` - リセットのテスト
     - `error handling` - エラーハンドリング
     - `edge cases` - エッジケース
   - 既存テスト（montecarlo.test.ts, martingale.test.ts）を参考にする

   ### e. 仕様書の作成（オプション） (`.dccs/{method}.md`)
   - issueの内容を元に詳細な仕様書を作成
   - 使用例、注意点、リスクなどを記載

3. **ビルドとテスト**
   - `npm run build` でビルド
   - `npm test` でテスト実行
   - エラーがあれば修正

4. **実装結果の報告**
   - 作成されたファイル一覧を表示
   - テスト結果を表示
   - 実装の要約を提示

## 注意事項

- 既存のコードスタイルに従う
- TypeScriptの厳格モードに準拠
- すべての入力パラメータをバリデーション
- エラーメッセージは明確に
- テストカバレッジは80%以上を目指す

## 実装例

例: `/implement 1` を実行した場合（Issue #1がダランベール法の場合）:

1. Issue #1の情報を取得
2. `src/types.ts` に `DAlembertState` を追加
3. `src/methods/dalembert.ts` を作成
4. `src/index.ts` に4つのツール（dalembert_init, dalembert_record, dalembert_status, dalembert_reset）を登録
5. `src/methods/__tests__/dalembert.test.ts` を作成
6. ビルドとテスト実行
7. 結果を報告
