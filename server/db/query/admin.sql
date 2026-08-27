-- name: GetDailyViews :many
SELECT
    strftime('%Y-%m-%d', substr(watched_at, 1, 26)) AS date,
    COUNT(*) AS view_count
FROM watched_history
WHERE substr(watched_at, 1, 26) >= ?
  AND substr(watched_at, 1, 26) < ?
  AND watched_at IS NOT NULL
GROUP BY strftime('%Y-%m-%d', substr(watched_at, 1, 26))
ORDER BY date DESC;


-- name: GetSeriesViews :many
SELECT
    COALESCE(s.id, 0) AS series_id,
    COALESCE(s.series_name_file, 'No Series') AS series_name,
    SUM(v.views) AS total_views,
    COUNT(v.id) AS video_count
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE v.is_deleted = 0
GROUP BY v.series_id
ORDER BY total_views DESC;


-- name: GetVideoRanking :many
SELECT
    v.id,
    v.file_name,
    v.views,
    v.updated_at,
    s.series_name_file AS series_name
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE v.is_deleted = 0
  AND v.views > 0
ORDER BY v.views DESC
LIMIT ?;


-- name: GetWatchedHistoryByDate :many
SELECT
    strftime('%Y-%m-%d', substr(watched_at, 1, 26)) AS date,
    COUNT(*) AS watch_count
FROM watched_history
WHERE substr(watched_at, 1, 26) >= ?
  AND substr(watched_at, 1, 26) < ?
  AND watched_at IS NOT NULL
GROUP BY strftime('%Y-%m-%d', substr(watched_at, 1, 26))
ORDER BY date DESC;

-- name: GetMonthlyStats :one
SELECT
    COUNT(DISTINCT strftime('%Y-%m-%d', substr(watched_at, 1, 26))) AS days_with_views,
    COUNT(*) AS total_views_this_month,
    COUNT(DISTINCT video_id) AS unique_videos_watched
FROM watched_history
WHERE substr(watched_at, 1, 26) >= ?
  AND substr(watched_at, 1, 26) < ?
  AND watched_at IS NOT NULL;