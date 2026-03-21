# AGENTS.md

## プロジェクト固有の注意事項

- yarn や go はそれぞれ `client/` と `server/` のディレクトリに移動した状態で実行してください。ルートディレクトリにはパッケージ管理系のファイルは一切配置していません。

- クライアントの開発サーバーは `https://localhost:7001` でリッスンされるので (Caddy による HTTPS リバースプロキシが同時に起動されるため)そちらでアクセスしてください。

## 技術スタック

CommePlayer は、クライアント・サーバーアーキテクチャに基づく Web アプリケーション です。

以下の2つの主要部分で構成されています。

CommeVideo が一般的な Web サービスと異なる点は、フロントエンドと API サーバーの両方が各ユーザーの PC 環境で動作する点です。

- `client/`: CommeVideo のフロントエンドアプリケーション
  - TypeScript
  - Next.js 3.x
    - MUI
    - Zustand
- `server/`: CommeVideo のバックエンド API サーバー
  - Go
  - Chi
  - sqlc
    - SQLite 
    - マイグレーションツール

## ディレクトリ構成

### クライアント (`client/`)

### サーバー (`server/`)


## コーディング規約

### 全般
- コードをざっくり斜め読みした際の可読性を高めるため、日本語のコメントを多めに記述する
- コードを変更する際、既存のコメントは、変更によりコメント内容がコードの記述と合わなくなった場合を除き、コメント量に関わらずそのまま保持する
- ログメッセージに関しては文字化けを避けるため、必ず英語で記述する
- それ以外のコーディングスタイルは、原則変更箇所周辺のコードスタイルに合わせる
- 不要な薄いラッパーや別名関数は作らず、責務のあるコンポーネントだけを追加する。
- コメントは冗長なくらいでちょうどよい。条件分岐・ループ・例外処理の直前にはその意図を書き、Python では `__init__()` で代入するインスタンス変数には「保持する情報」「参照されるメソッド」「前提条件」を必ずコメントとして記す。クラス Docstring には責務のみを記載し、引数説明は `__init__()` の Docstring に集約する
- Enum・Literal・Union 型の文字列表現は `tweet_capture_watermark_position: 'None' | 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';` のように基本的に UpperCamelCase で命名する必要がある
- 通常の Web サービスではないかなり特殊なソフトウェアなので、コンテキストとして分からないことがあれば別途 Readme.md を読むか、私に質問すること
- DB レコードの Pydantic / TypeScript 定義では、親となるレコード本体のスキーマを最上位に配置し、その下に子スキーマをフィールドの定義順に従って並べる
- JSON フィールドの値を生成する際は、辞書リテラル (`{}`) を直接書くのではなく、TypedDict のコンストラクタを使用して型構造を明示的に示す
- 画像の幅・高さ・総数・間隔など、視覚的に重要な情報を持つフィールドは定義の上部に集約し、重要度の高い順に配置することで一目で把握できるようにする
- 親スキーマから子スキーマへの並び順を徹底し、関連する子スキーマは親となる DB レコードスキーマの直下にまとめて配置する。可読性を損なうような配置変更は行わない
- TypeScript 側のスキーマ定義も Python 側と同じ順序を維持する。もし差分が発生する場合は、その理由をコメントで明記する

### Python コード
- **コードの編集後には、必ず `poetry run task lint` コマンドで、Ruff によるコードリンターと Pyright による型チェッカーを実行すること**
- 文字列にはシングルクォートを用いる (Docstring を除く)
- Python 3.11 の機能を使う (3.10 以下での動作は考慮不要)
- ビルトイン型を使用した Type Hint で実装する (from typing import List, Dict などは避ける)
- Pydantic モデル定義では必ず Annotated 記法を使う。`= Field()` 型の定義は行わずに全て Annotated 記法で定義すること
- 変数・インスタンス変数は snake_case で命名する
- 関数・クラス名は UpperCamelCase で命名する (例: `class VideoEncodingTask:`, `def GetClientURL():`)
  - FastAPI で定義するエンドポイントの関数名も UpperCamelCase で命名する必要がある
  - FastAPI で定義するエンドポイント名は、文法的に比較的正しくなるようパス名や操作を並び替えた上で、「〇〇API」の形で命名すること
    - 例: GET `/streams/live/{display_channel_id}/{quality}/mpegts` -> `LiveMPEGTSStreamAPI`
    - 例: PUT `/users/me` -> `UserUpdateAPI`
- クラスに生えたメソッド名は lowerCamelCase で命名する (例: `LiveStream.getONAirLiveStreams()`)
- 複数行のコレクションには末尾カンマを含める
- `getattr()` で型チェッカーを黙らせるのは禁止。参照する属性は型ヒントやプロパティできちんと公開し、どうしても `getattr()` が必要な場合は「その属性が必ず存在する根拠」を詳細にコメントする
- すべての Docstring には Args / Returns を明記し、コメントは処理のまとまりごとに必ず加えて「なぜそうするのか」「何を意図した値なのか」を丁寧に説明する。コードを読まなくてもコメントから処理の流れを追えるようにする
- このプロジェクトでは必ずロギングモジュールとして `import logging` の代わりに `from app import logging` を使うべき

### Vue / TypeScript コード

- **コードの編集後には、必ず `yarn lint; yarn typecheck` コマンドで、ESLint によるコードリンターと TypeScript による型チェッカーを実行すること**
- 文字列にはシングルクォートを用いる
- 新規で実装する箇所に関しては Vue 3 Composition API パターンに従う
  - Vue.js 2 から移行した関係で Options API で書かれているコンポーネントがあるが、それらは Options API のまま維持する
- 新規で実装する Vue 3 Composition API のコンポーネントでは、原則として変数を lowerCamelCase で命名する
  - FastAPI サーバーでは snake_case で命名している関係で外部 API のフィールドは全てスネークケースになっているが、これはそのまま参照して良い
- TypeScript による型安全性を確保する
- コンポーネント属性は可能な限り1行に記述 (約100文字まで)
- 必ず day.js を utils/index.ts からインポートして使うこと！！！new Date() を絶対に使うな！！！

### CSS / SCSS スタイリング
- このプロジェクトで使用している色 (CSS 変数) などは `client/src/App.vue` や `client/src/plugins/vuetify.ts` に定義しているので、それを参照すること
- 新規に UI を実装する際は、すでに実装されている他のコンポーネントやページの大まかなデザインの方向性を踏襲すること