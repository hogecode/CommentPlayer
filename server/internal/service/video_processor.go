package service

import (
	"crypto/md5"
	"fmt"
	"io"
	"log/slog"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

var (
	ffprobePath string
	ffmpegPath  string
)

// init - ffmpeg/ffprobe のパスを初期化
func init() {
	initFFmpegPaths()
}

// initFFmpegPaths - ffmpeg/ffprobe のパスを探す
func initFFmpegPaths() {
	// 複数の候補パスを定義（Windows/Linux/Mac対応）
	ffprobeCandidates := []string{
		"ffprobe",
		"ffprobe.exe",
		// Linux/Unix
		"/usr/bin/ffprobe",
		"/usr/local/bin/ffprobe",
		"/bin/ffprobe",
		// macOS
		"/opt/homebrew/bin/ffprobe",
		"/usr/local/opt/ffmpeg/bin/ffprobe",
		// Windows - 一般的なインストール先
		"C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
		"C:\\Program Files (x86)\\ffmpeg\\bin\\ffprobe.exe",
		"D:\\ffmpeg\\bin\\ffprobe.exe",
		"E:\\ffmpeg\\bin\\ffprobe.exe",
		// Windows - WinGet のインストール先
		"C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffprobe.exe",
		os.ExpandEnv("$LOCALAPPDATA\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffprobe.exe"),
	}

	ffmpegCandidates := []string{
		"ffmpeg",
		"ffmpeg.exe",
		// Linux/Unix
		"/usr/bin/ffmpeg",
		"/usr/local/bin/ffmpeg",
		"/bin/ffmpeg",
		// macOS
		"/opt/homebrew/bin/ffmpeg",
		"/usr/local/opt/ffmpeg/bin/ffmpeg",
		// Windows - 一般的なインストール先
		"C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
		"C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe",
		"D:\\ffmpeg\\bin\\ffmpeg.exe",
		"E:\\ffmpeg\\bin\\ffmpeg.exe",
		// Windows - WinGet のインストール先
		"C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe",
		os.ExpandEnv("$LOCALAPPDATA\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe"),
	}

	// ffprobe のパスを探す
	ffprobePath = "ffprobe" // デフォルト値
	for _, candidate := range ffprobeCandidates {
		// LookPath で探す
		if path, err := exec.LookPath(candidate); err == nil {
			ffprobePath = path
			slog.Info("initFFmpegPaths: ffprobe found",
				"path", ffprobePath)
			break
		}
		// 絶対パスの場合、ファイルが存在するか確認
		if _, err := os.Stat(candidate); err == nil {
			ffprobePath = candidate
			slog.Info("initFFmpegPaths: ffprobe found",
				"path", ffprobePath)
			break
		}
	}
	if ffprobePath == "ffprobe" {
		slog.Warn("initFFmpegPaths: ffprobe not found, using system default (may fail at runtime)")
	}

	// ffmpeg のパスを探す
	ffmpegPath = "ffmpeg" // デフォルト値
	for _, candidate := range ffmpegCandidates {
		// LookPath で探す
		if path, err := exec.LookPath(candidate); err == nil {
			ffmpegPath = path
			slog.Info("initFFmpegPaths: ffmpeg found",
				"path", ffmpegPath)
			break
		}
		// 絶対パスの場合、ファイルが存在するか確認
		if _, err := os.Stat(candidate); err == nil {
			ffmpegPath = candidate
			slog.Info("initFFmpegPaths: ffmpeg found",
				"path", ffmpegPath)
			break
		}
	}
	if ffmpegPath == "ffmpeg" {
		slog.Warn("initFFmpegPaths: ffmpeg not found, using system default (may fail at runtime)")
	}
}

// VideoMetadata - ビデオメタデータ
type VideoMetadata struct {
	FileHash           string
	FileSize           int64
	Duration           float64
	ScreenshotFilePath *string
}

// CalculateFileHash - ファイルのMD5ハッシュを計算（リトライ付き）
func CalculateFileHash(filePath string) (string, error) {
	// ファイルが別プロセスで使用中の可能性があるため、リトライロジックを実装
	const maxRetries = 5
	const retryDelay = 500 * time.Millisecond

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		file, err := os.Open(filePath)
		if err == nil {
			defer file.Close()

			hash := md5.New()
			if _, err := io.Copy(hash, file); err != nil {
				lastErr = err
				// コピーエラーの場合はリトライ
				time.Sleep(retryDelay)
				continue
			}

			return fmt.Sprintf("%x", hash.Sum(nil)), nil
		}

		lastErr = err

		// 最後の試行でない場合はリトライ
		if attempt < maxRetries-1 {
			slog.Debug("CalculateFileHash: Retrying file open",
				"file_path", filePath,
				"attempt", attempt+1,
				"max_retries", maxRetries,
				"error", err.Error())
			time.Sleep(retryDelay)
		}
	}

	return "", fmt.Errorf("failed to calculate hash after %d attempts: %w", maxRetries, lastErr)
}

// GetFileSize - ファイルサイズをバイト単位で取得（リトライ付き）
func GetFileSize(filePath string) (int64, error) {
	const maxRetries = 3
	const retryDelay = 200 * time.Millisecond

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		info, err := os.Stat(filePath)
		if err == nil {
			return info.Size(), nil
		}

		lastErr = err

		// 最後の試行でない場合はリトライ
		if attempt < maxRetries-1 {
			slog.Debug("GetFileSize: Retrying file stat",
				"file_path", filePath,
				"attempt", attempt+1,
				"max_retries", maxRetries)
			time.Sleep(retryDelay)
		}
	}

	return 0, fmt.Errorf("failed to get file size after %d attempts: %w", maxRetries, lastErr)
}

// GetVideoDuration - ffprobeを使用して動画の長さを取得（秒数、リトライ付き）
func GetVideoDuration(filePath string) (float64, error) {
	const maxRetries = 3
	const retryDelay = 200 * time.Millisecond

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		cmd := exec.Command(
			ffprobePath,
			"-v", "error",
			"-show_entries", "format=duration",
			"-of", "default=noprint_wrappers=1:nokey=1:nokey=1",
			filePath,
		)

		output, err := cmd.Output()
		if err == nil {
			// Windows の改行文字（\r\n）を含む可能性があるため、トリム処理を行う
			durationStr := strings.TrimSpace(string(output))
			duration, err := strconv.ParseFloat(durationStr, 64)
			if err == nil {
				return duration, nil
			}

			// Parse エラーの場合はリトライ対象外
			slog.Error("GetVideoDuration: Failed to parse duration",
				"ffprobe_output", durationStr,
				"video_path", filePath,
				"error", err.Error())
			return 0, err
		}

		lastErr = err

		// 最後の試行でない場合はリトライ
		if attempt < maxRetries-1 {
			slog.Debug("GetVideoDuration: Retrying ffprobe command",
				"file_path", filePath,
				"attempt", attempt+1,
				"max_retries", maxRetries,
				"error", err.Error())
			time.Sleep(retryDelay)
		}
	}

	slog.Error("GetVideoDuration: ffprobe command failed",
		"ffprobe_path", ffprobePath,
		"video_path", filePath,
		"attempts", maxRetries,
		"error", lastErr.Error())
	return 0, fmt.Errorf("ffprobe failed after %d attempts: %w", maxRetries, lastErr)
}

// CaptureScreenshot - ffmpegを使用してスクリーンショットを撮る（リトライ付き）
func CaptureScreenshot(videoPath string, outputDir string) (*string, error) {
	const maxRetries = 2
	const retryDelay = 500 * time.Millisecond

	// ランダムなファイル名を生成
	screenshotFileName := generateRandomString(16) + ".jpg"
	screenshotPath := filepath.Join(outputDir, screenshotFileName)

	var lastErr error
	for attempt := 0; attempt < maxRetries; attempt++ {
		// TODO: 動画の長さに応じてスクリーンショットを撮る位置をランダムで撮るようにする
		// 動画の中央付近（30%）からスクリーンショットを撮る
		cmd := exec.Command(
			ffmpegPath,
			"-i", videoPath,
			"-ss", "00:00:15",
			"-vframes", "1",
			"-q:v", "5",
			screenshotPath,
		)

		if err := cmd.Run(); err == nil {
			return &screenshotFileName, nil
		} else {
			lastErr = err

			// 最後の試行でない場合はリトライ
			if attempt < maxRetries-1 {
				slog.Debug("CaptureScreenshot: Retrying ffmpeg command",
					"video_path", videoPath,
					"output_path", screenshotPath,
					"attempt", attempt+1,
					"max_retries", maxRetries,
					"error", err.Error())
				time.Sleep(retryDelay)
			}
		}
	}

	slog.Error("CaptureScreenshot: ffmpeg command failed",
		"ffmpeg_path", ffmpegPath,
		"video_path", videoPath,
		"output_path", screenshotPath,
		"attempts", maxRetries,
		"error", lastErr.Error())
	return nil, fmt.Errorf("failed to capture screenshot after %d attempts: %w", maxRetries, lastErr)
}

// ExtractVideoMetadata - ビデオメタデータを抽出
func ExtractVideoMetadata(videoPath string, screenshotOutputDir string) (*VideoMetadata, error) {
	// ハッシュを計算
	hash, err := CalculateFileHash(videoPath)
	if err != nil {
		slog.Debug("ExtractVideoMetadata: Failed to calculate hash",
			"video_path", videoPath,
			"error", err.Error())
		return nil, fmt.Errorf("failed to calculate hash: %w", err)

	}

	// ファイルサイズを取得
	size, err := GetFileSize(videoPath)
	if err != nil {
		slog.Debug("ExtractVideoMetadata: Failed to get file size",
			"video_path", videoPath,
			"error", err.Error())
		return nil, fmt.Errorf("failed to get file size: %w", err)
	}

	// 動画の長さを取得
	duration, err := GetVideoDuration(videoPath)
	if err != nil {
		slog.Debug("ExtractVideoMetadata: Failed to get video duration",
			"video_path", videoPath,
			"error", err.Error())
		return nil, fmt.Errorf("failed to get video duration: %w", err)
	}

	// スクリーンショットを撮る
	var screenshotPath *string
	if screenshotOutputDir != "" {
		// ディレクトリが存在しなければ作成
		os.MkdirAll(screenshotOutputDir, 0755)
		screenshotPath, err = CaptureScreenshot(videoPath, screenshotOutputDir)
		if err != nil {
			// スクリーンショットの失敗は警告とし、処理を継続
			fmt.Printf("Warning: failed to capture screenshot: %v\n", err)
		}
	}

	return &VideoMetadata{
		FileHash:           hash,
		FileSize:           size,
		Duration:           duration,
		ScreenshotFilePath: screenshotPath,
	}, nil
}

// generateRandomString - 指定された長さのランダム文字列を生成
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

// IsVideoFile - ファイルが動画ファイルかどうかを判定
func IsVideoFile(fileName string) bool {
	ext := filepath.Ext(fileName)
	videoExtensions := map[string]bool{
		".mp4":  true,
		".mkv":  true,
		".avi":  true,
		".mov":  true,
		".flv":  true,
		".wmv":  true,
		".webm": true,
		".m4v":  true,
		".mpg":  true,
		".mpeg": true,
		".3gp":  true,
		".ogv":  true,
	}
	return videoExtensions[ext]
}

// IsCommentFile - ファイルがコメントファイルかどうかを判定
func IsCommentFile(fileName string) bool {
	ext := filepath.Ext(fileName)
	return ext == ".xml" || ext == ".json"
}

// GetBaseFileName - 拡張子を除いたファイル名を取得
func GetBaseFileName(fileName string) string {
	return fileName[:len(fileName)-len(filepath.Ext(fileName))]
}
