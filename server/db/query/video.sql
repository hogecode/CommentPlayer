-- name: GetVideoYears :many
SELECT DISTINCT CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) as year
FROM video
WHERE is_deleted = 0
AND jikkyo_date IS NOT NULL
ORDER BY year DESC;

-- name: SearchVideos :many
SELECT v.*
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE (v.file_name LIKE ?
       OR v.description LIKE ?
       OR s.syobocal_title_name LIKE ?
       OR v.subtitle LIKE ?)
  AND (? IS NULL OR v.status = ?)
ORDER BY v.jikkyo_date DESC
LIMIT ? OFFSET ?;

-- name: CountSearchVideos :one
SELECT COUNT(*) as count
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE (v.file_name LIKE ?
       OR v.description LIKE ?
       OR s.syobocal_title_name LIKE ?
       OR v.subtitle LIKE ?)
  AND (? IS NULL OR v.status = ?);

-- name: GetVideoByID :one
SELECT *
FROM video
WHERE id = ?;

-- name: GetSeriesByID :one
SELECT *
FROM series
WHERE id = ?;
