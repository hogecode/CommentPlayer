-- 初期スキーマ：entityフォルダのエンティティ定義に合わせた構成

-- Folder テーブル
CREATE TABLE IF NOT EXISTS folder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
    is_watched NUMERIC DEFAULT 1,
    created_at DATETIME,
    updated_at DATETIME
);

-- Series テーブル
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_name_file TEXT,
    syobocal_title_id INTEGER,
    syobocal_title_name TEXT,
    syobocal_title_name_en TEXT,
    comment JSON,
    first_year INTEGER,
    first_month INTEGER,
    first_end_year INTEGER,
    first_end_month INTEGER,
    subtitles JSON,
    created_at DATETIME,
    updated_at DATETIME
);

-- Video テーブル
CREATE TABLE IF NOT EXISTS video (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    folder_id INTEGER,
    series_id INTEGER,
    episode INTEGER,
    subtitle TEXT,
    file_path TEXT,
    description TEXT,
    status TEXT,
    file_hash TEXT,
    file_size INTEGER,
    jikkyo_comment_count INTEGER,
    jikkyo_date DATETIME,
    views INTEGER,
    liked NUMERIC,
    screenshot_file_path TEXT,
    duration REAL,
    thumbnail_info_json JSON,
    channel_id INTEGER,
    prog_start_time DATETIME,
    prog_end_time DATETIME,
    is_deleted NUMERIC,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_video_series FOREIGN KEY (series_id) REFERENCES series (id)
);

-- Capture テーブル
CREATE TABLE IF NOT EXISTS capture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    video_id INTEGER,
    save_dir TEXT,
    save_path TEXT,
    created_at DATETIME,
    playback_position REAL,
    comment_delay REAL
);

-- Users テーブル
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    password TEXT,
    is_admin INTEGER,
    client_settings_json JSON,
    niconico_user_id INTEGER,
    niconico_user_name TEXT,
    niconico_user_premium INTEGER,
    niconico_access_token TEXT,
    niconico_refresh_token TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
