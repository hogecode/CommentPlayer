-- name: GetSeriesByID :one
SELECT *
FROM series
WHERE id = ?;

-- name: GetSeriesByName :one
SELECT *
FROM series
WHERE series_name_file = ?;

-- name: GetAllSeries :many
SELECT *
FROM series
ORDER BY series_name_file ASC;

-- name: GetAllSeriesWithCount :many
SELECT s.*, COUNT(v.id) as video_count
FROM series s
LEFT JOIN video v ON s.id = v.series_id AND v.is_deleted = 0
GROUP BY s.id
ORDER BY s.series_name_file ASC;

-- name: CreateSeries :exec
INSERT INTO series (series_name_file, syobocal_title_id, syobocal_title_name, syobocal_title_name_en, comment, first_year, first_month, first_end_year, first_end_month, subtitles, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: UpdateSeries :exec
UPDATE series
SET series_name_file = ?, syobocal_title_id = ?, syobocal_title_name = ?, syobocal_title_name_en = ?, comment = ?, first_year = ?, first_month = ?, first_end_year = ?, first_end_month = ?, subtitles = ?, updated_at = ?
WHERE id = ?;

-- name: DeleteSeries :exec
DELETE FROM series
WHERE id = ?;
