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
  AND v.status = ?
ORDER BY v.jikkyo_date DESC
LIMIT ? OFFSET ?;

-- name: SearchVideosNoFilter :many
SELECT v.*
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE (v.file_name LIKE ?
       OR v.description LIKE ?
       OR s.syobocal_title_name LIKE ?
       OR v.subtitle LIKE ?)
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
  AND v.status = ?;

-- name: CountSearchVideosNoFilter :one
SELECT COUNT(*) as count
FROM video v
LEFT JOIN series s ON v.series_id = s.id
WHERE (v.file_name LIKE ?
       OR v.description LIKE ?
       OR s.syobocal_title_name LIKE ?
       OR v.subtitle LIKE ?);

-- name: GetVideoByID :one
SELECT *
FROM video
WHERE id = ?;

-- name: GetVideoListByStatus :many
SELECT *
FROM video
WHERE is_deleted = 0 AND status = ?
ORDER BY jikkyo_date DESC
LIMIT ? OFFSET ?;

-- name: CountVideoListByStatus :one
SELECT COUNT(*) as count
FROM video
WHERE is_deleted = 0 AND status = ?;

-- name: GetVideoListByYear :many
SELECT *
FROM video
WHERE is_deleted = 0 AND CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) = ?
ORDER BY jikkyo_date DESC
LIMIT ? OFFSET ?;

-- name: CountVideoListByYear :one
SELECT COUNT(*) as count
FROM video
WHERE is_deleted = 0 AND CAST(SUBSTR(jikkyo_date, 1, 4) AS INTEGER) = ?;

-- name: GetVideosForSeries :many
SELECT *
FROM video
WHERE series_id = ? AND is_deleted = 0
ORDER BY file_name ASC;
