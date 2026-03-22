package i18n

import (
	"fmt"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/pelletier/go-toml/v2"
)

// Messages - メッセージカタログ
type Messages struct {
	Errors  map[string]string `toml:"errors"`
	Success map[string]string `toml:"success"`
}

var (
	messagesJA Messages
	messagesEN Messages
	mu         sync.RWMutex
	currentLoc = "en" // デフォルトロケール
)

// Init - i18nを初期化
func Init() error {
	if err := loadMessages("ja", &messagesJA); err != nil {
		return err
	}
	if err := loadMessages("en", &messagesEN); err != nil {
		return err
	}
	return nil
}

// loadMessages - ロケールファイルを読み込む（TOML形式）
func loadMessages(locale string, msgs *Messages) error {
	// アセットパスの構築
	assetPath := fmt.Sprintf("internal/i18n/locales/%s.toml", locale)

	data, err := os.ReadFile(assetPath)
	if err != nil {
		log.Printf("Warning: failed to read i18n file %s: %v\n", assetPath, err)
		// デフォルト値を設定
		msgs.Errors = make(map[string]string)
		msgs.Success = make(map[string]string)
		return nil
	}

	if err := toml.Unmarshal(data, msgs); err != nil {
		return fmt.Errorf("failed to unmarshal TOML file %s: %w", assetPath, err)
	}

	return nil
}

// SetLocale - 現在のロケールを設定
func SetLocale(locale string) {
	mu.Lock()
	defer mu.Unlock()
	currentLoc = normalizeLocale(locale)
}

// GetLocale - 現在のロケールを取得
func GetLocale() string {
	mu.RLock()
	defer mu.RUnlock()
	return currentLoc
}

// T - メッセージを取得（キーの先頭を見て error or success を判定）
// 使用例：
//   i18n.T("invalid_query_params")  // エラーメッセージ
//   i18n.T("success.thumbnail_regenerated")  // 成功メッセージ
func T(key string) string {
	mu.RLock()
	defer mu.RUnlock()

	// "success." プレフィックスで成功メッセージかエラーメッセージかを判定
	if strings.HasPrefix(key, "success.") {
		actualKey := strings.TrimPrefix(key, "success.")
		return getTMessage("success", actualKey, currentLoc)
	}

	// デフォルトはエラーメッセージ
	return getTMessage("error", key, currentLoc)
}

// TWithLocale - 指定ロケールでメッセージを取得
func TWithLocale(key, locale string) string {
	// "success." プレフィックスで成功メッセージかエラーメッセージかを判定
	if strings.HasPrefix(key, "success.") {
		actualKey := strings.TrimPrefix(key, "success.")
		return getTMessage("success", actualKey, locale)
	}

	// デフォルトはエラーメッセージ
	return getTMessage("error", key, locale)
}

// getTMessage - メッセージタイプとキーで取得
func getTMessage(msgType, key, locale string) string {
	msgs := selectLocale(locale)

	switch msgType {
	case "success":
		if msg, ok := msgs.Success[key]; ok {
			return msg
		}
		// フォールバック：英語
		if locale != "en" {
			if msg, ok := messagesEN.Success[key]; ok {
				return msg
			}
		}
		return key // キーがない場合はキー自体を返す

	case "error":
		if msg, ok := msgs.Errors[key]; ok {
			return msg
		}
		// フォールバック：英語
		if locale != "en" {
			if msg, ok := messagesEN.Errors[key]; ok {
				return msg
			}
		}
		return key // キーがない場合はキー自体を返す

	default:
		return key
	}
}

// GetErrorMessage - エラーメッセージを取得（後方互換性）
func GetErrorMessage(locale, key string) string {
	return getTMessage("error", key, locale)
}

// GetSuccessMessage - 成功メッセージを取得（後方互換性）
func GetSuccessMessage(locale, key string) string {
	return getTMessage("success", key, locale)
}

// selectLocale - ロケールを選択
func selectLocale(locale string) *Messages {
	normalized := normalizeLocale(locale)
	if normalized == "ja" {
		return &messagesJA
	}
	return &messagesEN
}

// normalizeLocale - ロケール文字列を正規化
// "ja-JP,ja;q=0.9" -> "ja"
func normalizeLocale(locale string) string {
	// Accept-Language ヘッダーから最初の言語コードを取得
	parts := strings.Split(locale, ",")
	if len(parts) > 0 {
		locale = parts[0]
	}
	locale = strings.Split(locale, ";")[0]
	locale = strings.Split(locale, "-")[0]
	locale = strings.ToLower(strings.TrimSpace(locale))

	if locale == "ja" || strings.HasPrefix(locale, "ja") {
		return "ja"
	}
	return "en"
}

// GetLocaleFromRequest - HTTPリクエストから言語を取得
func GetLocaleFromRequest(acceptLanguage string) string {
	if acceptLanguage == "" {
		return "en"
	}
	// Accept-Language ヘッダーから最初の言語コードを取得
	parts := strings.Split(acceptLanguage, ",")
	if len(parts) > 0 {
		lang := strings.Split(parts[0], ";")[0]
		lang = strings.ToLower(strings.TrimSpace(lang))
		return lang
	}
	return "en"
}
