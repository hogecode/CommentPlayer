-- マイリストテーブル作成
CREATE TABLE IF NOT EXISTS mylist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(video_id) REFERENCES video(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_mylist_user_id ON mylist(user_id);
CREATE INDEX IF NOT EXISTS idx_mylist_video_id ON mylist(video_id);
