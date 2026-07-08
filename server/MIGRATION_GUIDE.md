# GORMからsqlc + dbmateへの段階的移行ガイド

このガイドは、既存のGORM AutoMigrateからsqlc + dbmate（マイグレーション）への段階的な移行手順を説明します。

## 📋 現在のセットアップ

### ファイル構成

```
server/
├── sqlc.yaml                              # sqlc設定ファイル
├── db/
│   ├── migrations/                        # dbmate マイグレーションファイル
│   │   ├── 20250708000_init_schema.up.sql
│   │   └── 20250708000_init_schema.down.sql
│   └── query/                             # sqlc クエリファイル
│       └── video.sql
├── internal/
│   ├── db/                                # sqlcが生成するコード（作成予定）
│   ├── query/                             # 既存GORMコード（保持）
│   │   ├── video_query.go
│   │   └── ...
│   └── entity/                            # 既存エンティティ（保持）
└── ...
```

## 🛠️ セットアップ手順

### ステップ1: ツールのインストール

```bash
# sqlc のインストール
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# dbmate のインストール
go install github.com/amacneil/dbmate@latest

# インストール確認
sqlc version
dbmate --version
```

### ステップ2: マイグレーション適用（ローカル開発）

既存の`app.db`がある場合は、バックアップを取ってから実行します。

```bash
# ローカルで新規DBに対してマイグレーション実行
cd server
dbmate -d db/migrations -e DB_URL up

# または、既存のapp.dbに適用する場合
export DB_URL="sqlite:app.db"
dbmate -d db/migrations up
```

**注意**: 既存の`app.db`をそのまま残したい場合は、dbmateは実行せず、GORM AutoMigrateのままで問題ありません。

### ステップ3: sqlcコード生成

```bash
cd server
sqlc generate
```

生成されたコードは `internal/db/` に配置されます。

## 📝 使用方法

### 既存GORMコード（そのまま使用可能）

```go
// 既存のGORMコードは継続して使用できます
func (q *VideoQuery) GetVideoYears() ([]int, error) {
    var years []*int
    err := q.db.Raw("SELECT DISTINCT ...").Scan(&years).Error
    // ...
}
```

### 新規実装でsqlcを使用

```go
package service

import (
    "context"
    "database/sql"
    db "github.com/hogecode/commentPlayer/internal/db"
)

type VideoServiceNew struct {
    db *sql.DB
    queries *db.Queries
}

func NewVideoServiceNew(conn *sql.DB) *VideoServiceNew {
    return &VideoServiceNew{
        db: conn,
        queries: db.New(conn),
    }
}

// sqlcで生成されたメソッドを使用
func (s *VideoServiceNew) GetVideoYears(ctx context.Context) ([]int, error) {
    years, err := s.queries.GetVideoYears(ctx)
    if err != nil {
        return nil, err
    }
    
    result := make([]int, 0, len(years))
    for _, year := range years {
        if year != nil {
            result = append(result, *year)
        }
    }
    return result, nil
}
```

## 📚 クエリ追加方法

新しいSQLクエリを追加する場合：

### 1. `db/query/video.sql`にクエリを追加

```sql
-- name: GetVideosByYear :many
SELECT *
FROM video
WHERE CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) = ?
ORDER BY jikkyo_date DESC;
```

### 2. sqlcコード生成

```bash
sqlc generate
```

### 3. 生成されたメソッドを使用

```go
videos, err := s.queries.GetVideosByYear(ctx, 2025)
```

## 🔗 マイグレーション追加方法

新しいテーブルやカラムを追加する場合：

### 1. マイグレーションファイル作成

```bash
dbmate new add_column_to_video
```

### 2. `db/migrations/` に up/down ファイルを編集

```sql
-- up
ALTER TABLE video ADD COLUMN new_column TEXT;

-- down
ALTER TABLE video DROP COLUMN new_column;
```

### 3. マイグレーション実行

```bash
export DB_URL="sqlite:app.db"
dbmate up
```


## 🚀 Makefileコマンド（推奨）

以下をMakefileに追加することをお勧めします：

```makefile
.PHONY: db-migrate
db-migrate:
	cd server && dbmate -d db/migrations up

.PHONY: db-migrate-down
db-migrate-down:
	cd server && dbmate -d db/migrations down

.PHONY: db-migrate-new
db-migrate-new:
	cd server && dbmate -d db/migrations new $(NAME)

.PHONY: db-generate-sqlc
db-generate-sqlc:
	cd server && sqlc generate

.PHONY: db-setup
db-setup: db-migrate db-generate-sqlc
	@echo "Database setup complete"
```

使用例：
```bash
make db-migrate              # マイグレーション実行
make db-migrate-new NAME=add_users  # 新しいマイグレーション作成
make db-generate-sqlc       # sqlcコード生成
make db-setup              # 全て実行
```

