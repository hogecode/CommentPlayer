-- ロールバック：すべてのテーブルとインデックスを削除
DROP INDEX IF EXISTS idx_capture_video_id;
DROP INDEX IF EXISTS idx_video_file_name;
DROP INDEX IF EXISTS idx_video_is_deleted;
DROP INDEX IF EXISTS idx_video_series_id;
DROP INDEX IF EXISTS idx_video_folder_id;

DROP TABLE IF EXISTS capture;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS video;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS folder;
