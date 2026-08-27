-- Watched History テーブル - ユーザーの動画視聴履歴を記録
CREATE TABLE IF NOT EXISTS watched_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_watched_history_video FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE
);

-- ビデオID と watched_at でインデックスを作成（効率的なクエリのため）
CREATE INDEX IF NOT EXISTS idx_watched_history_video_id ON watched_history(video_id);
CREATE INDEX IF NOT EXISTS idx_watched_history_watched_at ON watched_history(watched_at DESC);
