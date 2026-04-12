package utils

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// DownloadFile downloads a file from URL to the specified path
func DownloadFile(url string, filePath string) (int64, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return 0, fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, fmt.Errorf("リクエストの作成に失敗しました: %w", err)
	}

	// Add User-Agent to avoid being blocked
	req.Header.Set("User-Agent", "CommentPlayer-Installer/1.0")

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("ダウンロードに失敗しました: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return 0, fmt.Errorf("ダウンロードに失敗しました (ステータスコード: %d)", resp.StatusCode)
	}

	// Create output file
	out, err := os.Create(filePath)
	if err != nil {
		return 0, fmt.Errorf("ファイルの作成に失敗しました: %w", err)
	}
	defer out.Close()

	// Copy response body to file
	written, err := io.Copy(out, resp.Body)
	if err != nil {
		return 0, fmt.Errorf("ファイルの書き込みに失敗しました: %w", err)
	}

	return written, nil
}

// DownloadFileWithProgress downloads a file with progress callback
func DownloadFileWithProgress(url string, filePath string, progressCallback func(current, total int64)) (int64, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return 0, fmt.Errorf("ディレクトリの作成に失敗しました: %w", err)
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, fmt.Errorf("リクエストの作成に失敗しました: %w", err)
	}

	// Add User-Agent to avoid being blocked
	req.Header.Set("User-Agent", "CommentPlayer-Installer/1.0")

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("ダウンロードに失敗しました: %w", err)
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return 0, fmt.Errorf("ダウンロードに失敗しました (ステータスコード: %d)", resp.StatusCode)
	}

	// Get total file size
	total := resp.ContentLength

	// Create output file
	out, err := os.Create(filePath)
	if err != nil {
		return 0, fmt.Errorf("ファイルの作成に失敗しました: %w", err)
	}
	defer out.Close()

	// Copy response body to file with progress tracking
	reader := io.TeeReader(resp.Body, &progressWriter{
		callback: progressCallback,
		total:    total,
	})

	written, err := io.Copy(out, reader)
	if err != nil {
		return 0, fmt.Errorf("ファイルの書き込みに失敗しました: %w", err)
	}

	return written, nil
}

// progressWriter is a helper type for tracking download progress
type progressWriter struct {
	callback func(current, total int64)
	total    int64
	current  int64
}

func (pw *progressWriter) Write(p []byte) (n int, err error) {
	n = len(p)
	pw.current += int64(n)
	if pw.callback != nil {
		pw.callback(pw.current, pw.total)
	}
	return
}

// GetGitHubReleaseDownloadURL constructs GitHub release download URL
func GetGitHubReleaseDownloadURL(owner, repo, version, filename string) string {
	return fmt.Sprintf(
		"https://github.com/%s/%s/releases/download/%s/%s",
		owner, repo, version, filename,
	)
}

// GetGitHubLatestReleaseURL constructs GitHub API URL for latest release
func GetGitHubLatestReleaseURL(owner, repo string) string {
	return fmt.Sprintf(
		"https://api.github.com/repos/%s/%s/releases/latest",
		owner, repo,
	)
}

// ExtractTarGz extracts a tar.gz file to the specified destination directory
func ExtractTarGz(tarGzPath, destDir string) error {
	// Open the tar.gz file
	file, err := os.Open(tarGzPath)
	if err != nil {
		return fmt.Errorf("tar.gz ファイルのオープンに失敗しました: %w", err)
	}
	defer file.Close()

	// Create gzip reader
	gzipReader, err := gzip.NewReader(file)
	if err != nil {
		return fmt.Errorf("gzip リーダーの作成に失敗しました: %w", err)
	}
	defer gzipReader.Close()

	// Create tar reader
	tarReader := tar.NewReader(gzipReader)

	// Create destination directory if it doesn't exist
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("出力ディレクトリの作成に失敗しました: %w", err)
	}

	// Extract each file from the tar archive
	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("tar ヘッダーの読み込みに失敗しました: %w", err)
		}

		// Construct full file path
		target := filepath.Join(destDir, header.Name)

		// Check if target path is within destination directory (security check)
		absTarget, err := filepath.Abs(target)
		if err != nil {
			return fmt.Errorf("パスの解析に失敗しました: %w", err)
		}
		absDest, err := filepath.Abs(destDir)
		if err != nil {
			return fmt.Errorf("出力ディレクトリパスの解析に失敗しました: %w", err)
		}
		if !filepath.HasPrefix(absTarget, absDest) {
			return fmt.Errorf("ファイルパスが不正です: %s", target)
		}

		switch header.Typeflag {
		case tar.TypeDir:
			// Create directory
			if err := os.MkdirAll(target, os.FileMode(header.Mode)); err != nil {
				return fmt.Errorf("ディレクトリ作成に失敗しました: %w", err)
			}

		case tar.TypeReg:
			// Create file
			// Create parent directory if needed
			if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
				return fmt.Errorf("親ディレクトリの作成に失敗しました: %w", err)
			}

			// Create the file
			file, err := os.Create(target)
			if err != nil {
				return fmt.Errorf("ファイル作成に失敗しました: %w", err)
			}

			// Copy file contents
			if _, err := io.Copy(file, tarReader); err != nil {
				file.Close()
				return fmt.Errorf("ファイル書き込みに失敗しました: %w", err)
			}
			file.Close()

			// Set file permissions
			if err := os.Chmod(target, os.FileMode(header.Mode)); err != nil {
				return fmt.Errorf("ファイル権限設定に失敗しました: %w", err)
			}

		case tar.TypeSymlink:
			// Create symbolic link
			if err := os.Symlink(header.Linkname, target); err != nil {
				return fmt.Errorf("シンボリックリンク作成に失敗しました: %w", err)
			}
		}
	}

	return nil
}
