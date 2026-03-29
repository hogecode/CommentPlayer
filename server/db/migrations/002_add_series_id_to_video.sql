-- Add series_id column to video table
ALTER TABLE video ADD COLUMN series_id INTEGER;

-- Add foreign key constraint for series_id
CREATE INDEX IF NOT EXISTS idx_video_series_id ON video(series_id);
