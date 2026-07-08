-- name: GetCaptureListByVideo :many
SELECT *
FROM capture
WHERE video_id = ?
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: CountCaptureListByVideo :one
SELECT COUNT(*) as count
FROM capture
WHERE video_id = ?;

-- name: GetAllCaptures :many
SELECT *
FROM capture
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- name: CountAllCaptures :one
SELECT COUNT(*) as count
FROM capture;

-- name: CreateCapture :exec
INSERT INTO capture (filename, video_id, save_dir, save_path, created_at, playback_position, comment_delay)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- name: GetCaptureByID :one
SELECT *
FROM capture
WHERE id = ?;

-- name: UpdateCapture :exec
UPDATE capture
SET filename = ?, video_id = ?, save_dir = ?, save_path = ?, playback_position = ?, comment_delay = ?
WHERE id = ?;

-- name: DeleteCapture :exec
DELETE FROM capture
WHERE id = ?;
