-- Create series table
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for series_name_file for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_series_name_file ON series(series_name_file);
