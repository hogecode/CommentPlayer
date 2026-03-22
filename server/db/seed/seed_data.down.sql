-- シードデータの削除
-- 削除順序は外部キー制約を考慮（Capture -> Video -> Folder -> Users）

DELETE FROM capture;
DELETE FROM video;
DELETE FROM folder;
DELETE FROM users;
