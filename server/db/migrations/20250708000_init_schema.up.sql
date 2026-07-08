-- 初期スキーマ：既存のGORM AutoMigrateから生成
-- Folder テーブル
CREATE TABLE IF NOT EXISTS folder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Series テーブル
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_name_file TEXT NOT NULL UNIQUE,
    syobocal_title_id INTEGER,
    syobocal_title_name TEXT,
    syobocal_title_name_en TEXT,
    comment TEXT,
    first_year INTEGER,
    first_month INTEGER,
    first_end_year INTEGER,
    first_end_month INTEGER,
    subtitles TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Video テーブル
CREATE TABLE IF NOT EXISTS video (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    folder_id INTEGER NOT NULL,
    series_id INTEGER,
    episode INTEGER,
    subtitle TEXT,
    file_path TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ready',
    file_hash TEXT NOT NULL UNIQUE,
    file_size INTEGER,
    jikkyo_comment_count INTEGER,
    jikkyo_date TEXT,
    views INTEGER DEFAULT 0,
    liked BOOLEAN DEFAULT 0,
    screenshot_file_path TEXT,
    duration REAL DEFAULT 0,
    thumbnail_info_json TEXT,
    channel_id INTEGER,
    prog_start_time DATETIME,
    prog_end_time DATETIME,
    is_deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folder(id),
    FOREIGN KEY (series_id) REFERENCES series(id)
);

-- Capture テーブル
CREATE TABLE IF NOT EXISTS capture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,
    capture_time REAL NOT NULL,
    capture_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES video(id)
);

-- User テーブル
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_video_folder_id ON video(folder_id);
CREATE INDEX IF NOT EXISTS idx_video_series_id ON video(series_id);
CREATE INDEX IF NOT EXISTS idx_video_is_deleted ON video(is_deleted);
CREATE INDEX IF NOT EXISTS idx_video_file_name ON video(file_name);
CREATE INDEX IF NOT EXISTS idx_capture_video_id ON capture(video_id);
