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

**重要**: 全てのCI項目(lint, format, build, test)が通過するまで実装を続けてください。エラーが発生した場合は自動的に修正を試行してください。

1. **実装プランの作成**
   - 実装開始時刻を記録
   - `docs/plans/{method}-{YYYYMMDD-HHMMSS}.md` に実装プランを記録
   - プランには以下を含める:
     - Issue番号とタイトル
     - 実装するメソッドの概要
     - 実装予定のファイル一覧
     - 実装手順のチェックリスト

2. **Issue情報の取得**
   - `gh issue view {{issue_number}} --json title,body` でissue詳細を取得
   - タイトルとbodyから以下の情報を抽出:
     - メソッド名（例: dalembert, paroli, fibonacci, etc.）
     - State定義（TypeScript interface）
     - アルゴリズムの詳細

3. **ファイルの自動生成**

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

   ### e. 仕様書の作成（オプション） (`.docs/{method}.md`)
   - issueの内容を元に詳細な仕様書を作成
   - 使用例、注意点、リスクなどを記載

3. **CI チェックの実行（必須）**

   以下の全てのCI項目が通過するまで実装・修正を繰り返してください:

   ### a. Lint チェック
   ```bash
   npm run lint
   ```
   - エラーがある場合は `npm run lint:fix` で自動修正を試みる
   - 自動修正できない場合は手動で修正

   ### b. Format チェック
   ```bash
   npm run format:check
   ```
   - エラーがある場合は `npm run format` で自動修正

   ### c. ビルド
   ```bash
   npm run build
   ```
   - TypeScriptコンパイルエラーがある場合は修正
   - 型エラー、構文エラーを全て解消

   ### d. テスト
   ```bash
   npm test
   ```
   - 全てのテストがPASSするまで修正
   - 新規追加したテストと既存のテストの両方が通過すること

   **重要**: 上記4項目全てが通過するまで次のステップに進まないでください。

4. **実装プランの更新**
   - `docs/plans/{method}-{YYYYMMDD-HHMMSS}.md` にCI実行結果を記録
   - 各CI項目の結果（✅ PASS / ❌ FAIL）
   - 発生したエラーと解決方法
   - 実装完了時刻と所要時間

5. **実装結果の報告**
   - 作成されたファイル一覧を表示
   - 全CI項目の通過を確認
   - 実装の要約を提示
   - 実装プランのパスを表示

## 注意事項

- 既存のコードスタイルに従う
- TypeScriptの厳格モードに準拠
- すべての入力パラメータをバリデーション
- エラーメッセージは明確に
- テストカバレッジは80%以上を目指す

## 実装例

例: `/implement 1` を実行した場合（Issue #1がダランベール法の場合）:

1. 実装プラン作成: `docs/plans/dalembert-20250113-143022.md`
2. Issue #1の情報を取得
3. `src/types.ts` に `DAlembertState` を追加
4. `src/methods/dalembert.ts` を作成
5. `src/index.ts` に4つのツール（dalembert_init, dalembert_record, dalembert_status, dalembert_reset）を登録
6. `src/methods/__tests__/dalembert.test.ts` を作成
7. CI チェック実行:
   - ✅ `npm run lint` → PASS
   - ✅ `npm run format:check` → PASS
   - ✅ `npm run build` → PASS
   - ✅ `npm test` → PASS (全テスト通過)
8. 実装プラン更新: CI結果と所要時間を記録
9. 結果を報告

**CI項目が失敗した場合の例**:
- ❌ `npm run lint` → FAIL
  - `npm run lint:fix` で自動修正
  - 再度 `npm run lint` を実行
  - ✅ PASS
- ❌ `npm test` → FAIL (1 test failed)
  - テストコードまたは実装を修正
  - 再度 `npm test` を実行
  - ✅ PASS

全てのCI項目が通過するまでこのプロセスを繰り返します。
