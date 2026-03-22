package service

import (
	"crypto/md5"
	"fmt"
	"io"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"
)

// VideoMetadata - ビデオメタデータ
type VideoMetadata struct {
	FileHash           string
	FileSize           int64
	Duration           float64
	ScreenshotFilePath *string
}

// CalculateFileHash - ファイルのMD5ハッシュを計算
func CalculateFileHash(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

// GetFileSize - ファイルサイズをバイト単位で取得
func GetFileSize(filePath string) (int64, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}

// GetVideoDuration - ffprobeを使用して動画の長さを取得（秒数）
func GetVideoDuration(filePath string) (float64, error) {
	cmd := exec.Command(
		"ffprobe",
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1:nokey=1",
		filePath,
	)

	output, err := cmd.Output()
	if err != nil {
		return 0, err
	}

	duration, err := strconv.ParseFloat(string(output[:len(output)-1]), 64)
	if err != nil {
		return 0, err
	}

	return duration, nil
}

// CaptureScreenshot - ffmpegを使用してスクリーンショットを撮る
func CaptureScreenshot(videoPath string, outputDir string) (*string, error) {
	// ランダムなファイル名を生成
	screenshotFileName := generateRandomString(16) + ".jpg"
	screenshotPath := filepath.Join(outputDir, screenshotFileName)

	// TODO: 動画の長さに応じてスクリーンショットを撮る位置をランダムで撮るようにする
	// 動画の中央付近（30%）からスクリーンショットを撮る
	cmd := exec.Command(
		"ffmpeg",
		"-i", videoPath,
		"-ss", "00:00:15",
		"-vframes", "1",
		"-q:v", "5",
		screenshotPath,
	)

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("failed to capture screenshot: %w", err)
	}

	return &screenshotFileName, nil
}

// ExtractVideoMetadata - ビデオメタデータを抽出
func ExtractVideoMetadata(videoPath string, screenshotOutputDir string) (*VideoMetadata, error) {
	// ハッシュを計算
	hash, err := CalculateFileHash(videoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate hash: %w", err)
	}

	// ファイルサイズを取得
	size, err := GetFileSize(videoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get file size: %w", err)
	}

	// 動画の長さを取得
	duration, err := GetVideoDuration(videoPath)
	if err != nil {
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
