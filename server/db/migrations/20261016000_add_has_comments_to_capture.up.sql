-- capture テーブルに has_comments カラムを追加
ALTER TABLE capture ADD COLUMN has_comments INTEGER DEFAULT 0;
