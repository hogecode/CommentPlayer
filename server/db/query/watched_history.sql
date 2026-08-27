-- name: CreateWatchedHistory :exec
INSERT INTO watched_history (video_id, watched_at)
VALUES (?, ?);

-- name: GetWatchedHistoryByVideoID :many
SELECT *
FROM watched_history
WHERE video_id = ?
ORDER BY watched_at DESC
LIMIT ? OFFSET ?;

-- name: CountWatchedHistoryByVideoID :one
SELECT COUNT(*) as count
FROM watched_history
WHERE video_id = ?;

-- name: GetRecentWatchedHistory :many
SELECT *
FROM watched_history
ORDER BY watched_at DESC
LIMIT ? OFFSET ?;

-- name: DeleteWatchedHistoryByVideoID :exec
DELETE FROM watched_history
WHERE video_id = ?;
