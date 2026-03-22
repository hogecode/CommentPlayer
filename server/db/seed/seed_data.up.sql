-- シードデータの挿入
-- Folderデータの挿入
INSERT INTO folder (path, is_watched, created_at, updated_at) VALUES
('./videos/sample1', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('./videos/sample2', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Userデータの挿入
INSERT INTO users (name, password, is_admin, created_at, updated_at) VALUES
('admin', '$2a$10$dummy_hash_for_admin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user', '$2a$10$dummy_hash_for_user', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Videoデータの挿入
INSERT INTO video (file_name, folder_id, file_path, file_hash, file_size, jikkyo_comment_count, views, liked, duration, is_deleted, status, created_at, updated_at) VALUES
('sample_video_1.mp4', 1, './videos/sample1/sample_video_1.mp4', 'hash_001', 1024000, 5, 100, 0, 60.5, 0, 'ready', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sample_video_2.mp4', 2, './videos/sample2/sample_video_2.mp4', 'hash_002', 2048000, 5, 100, 0, 120.5, 0, 'ready', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Captureデータの挿入
INSERT INTO capture (filename, video_id, created_at) VALUES
('capture_001.png', 1, CURRENT_TIMESTAMP),
('capture_002.png', 1, CURRENT_TIMESTAMP),
('capture_003.png', 2, CURRENT_TIMESTAMP);
