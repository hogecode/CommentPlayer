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


-- name: GetDailyViewsWithDetails :many
SELECT
    strftime('%Y-%m-%d', substr(wh.watched_at, 1, 26)) AS date,
    COUNT(*) AS view_count,
    wh.id,
    v.file_name,
    v.episode,
    v.subtitle,
    COALESCE(s.syobocal_title_name, 'No Series') AS series_name
FROM watched_history wh
LEFT JOIN video v ON wh.video_id = v.id
LEFT JOIN series s ON v.series_id = s.id
WHERE substr(wh.watched_at, 1, 26) >= ?
  AND substr(wh.watched_at, 1, 26) < ?
  AND wh.watched_at IS NOT NULL
GROUP BY strftime('%Y-%m-%d', substr(wh.watched_at, 1, 26)), wh.video_id, v.file_name, v.episode, s.syobocal_title_name
ORDER BY date DESC, MAX(wh.watched_at) DESC;


-- name: GetSeriesViews :many
SELECT
    COALESCE(s.id, 0) AS series_id,
    COALESCE(s.syobocal_title_name, 'Total Series') AS series_name,
    COUNT(DISTINCT wh.id) AS view_count,
    COUNT(DISTINCT v.id) AS video_count
FROM video v
LEFT JOIN series s
    ON v.series_id = s.id
LEFT JOIN watched_history wh
    ON wh.video_id = v.id
    AND substr(wh.watched_at, 1, 26) >= ?
    AND substr(wh.watched_at, 1, 26) < ?
WHERE v.is_deleted = 0
GROUP BY s.id, s.syobocal_title_name
ORDER BY view_count DESC;



-- name: GetVideoRanking :many
SELECT
    v.id,
    v.file_name,
    v.views,
    v.updated_at,
    s.syobocal_title_name AS series_name
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

-- name: GetSeriesEpisodeWatchHistory :many
-- 特定シリーズのエピソード別視聴履歴を取得
SELECT
    v.id,
    v.episode,
    v.subtitle,
    v.file_name,
    v.views,
    wh.id AS watch_history_id,
    wh.watched_at
FROM video v
LEFT JOIN watched_history wh ON v.id = wh.video_id
WHERE v.series_id = ?
  AND v.is_deleted = 0
ORDER BY v.episode ASC, wh.watched_at DESC;