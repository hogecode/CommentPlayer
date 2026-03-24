package logger

import (
	"context"
	"io"
	"log/slog"
	"os"
	"strings"

	"github.com/hogecode/commentPlayer/internal/config"
)

// Init - ロガーを初期化
func Init(cfg *config.Config) error {
	var level slog.Level
	switch strings.ToLower(cfg.Log.Level) {
	case "debug":
		level = slog.LevelDebug
	case "info":
		level = slog.LevelInfo
	case "warn", "warning":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	// 環境別のログレベル調整
	if cfg.Environment == config.Production {
		// 本番環境ではWarn以上のみ出力
		if level < slog.LevelWarn {
			level = slog.LevelWarn
		}
	} else if cfg.Environment == config.Development {
		// 開発環境ではDebugレベルを許可
		if level > slog.LevelDebug {
			level = slog.LevelDebug
		}
	}

	var handler slog.Handler
	if cfg.Log.UseColor {
		handler = NewColoredHandler(os.Stdout, &slog.HandlerOptions{
			Level: level,
		})
	} else {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: level,
		})
	}

	slog.SetDefault(slog.New(handler))
	return nil
}

// ColoredHandler - 色付きコンソール出力ハンドラー
type ColoredHandler struct {
	writer io.Writer
	opts   *slog.HandlerOptions
}

// NewColoredHandler - ColoredHandler を生成
func NewColoredHandler(w io.Writer, opts *slog.HandlerOptions) *ColoredHandler {
	if opts == nil {
		opts = &slog.HandlerOptions{}
	}
	return &ColoredHandler{
		writer: w,
		opts:   opts,
	}
}

// Handle - ログレコードをハンドル
func (h *ColoredHandler) Handle(ctx context.Context, r slog.Record) error {
	level := r.Level.String()
	levelColor := getLevelColor(r.Level)

	// ANSI色コード
	const (
		reset   = "\033[0m"
		dimGray = "\033[2;37m"
		cyan    = "\033[36m"
		white   = "\033[97m"
	)

	// タイムスタンプ、レベル、メッセージをフォーマット
	timestamp := r.Time.Format("2006-01-02 15:04:05")

	// レベルを色付きで出力
	levelStr := levelColor + "[" + level + "]" + reset

	// メッセージ部分
	msg := white + r.Message + reset

	// タイムスタンプ部分
	timeStr := dimGray + timestamp + reset

	output := timeStr + " " + levelStr + " " + msg

	// 属性を追加
	r.Attrs(func(attr slog.Attr) bool {
		output += " " + cyan + attr.Key + reset + "=" + white + attr.Value.String() + reset
		return true
	})

	output += "\n"

	_, err := h.writer.Write([]byte(output))
	return err
}

// WithAttrs - 属性を追加
func (h *ColoredHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return h
}

// WithGroup - グループを追加
func (h *ColoredHandler) WithGroup(name string) slog.Handler {
	return h
}

// Enabled - レベルが有効かを判定
func (h *ColoredHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return true
}

// getLevelColor - ログレベルに対応する色を取得
func getLevelColor(level slog.Level) string {
	const (
		red    = "\033[31m" // エラー: 赤
		yellow = "\033[33m" // 警告: 黄
		green  = "\033[32m" // 情報: 緑
		blue   = "\033[34m" // デバッグ: 青
	)

	switch level {
	case slog.LevelError:
		return red
	case slog.LevelWarn:
		return yellow
	case slog.LevelInfo:
		return green
	case slog.LevelDebug:
		return blue
	default:
		return green
	}
}
