package i18n

import (
	"encoding/json"
	"log"
	"os"
	"strings"
)

// Messages - メッセージカタログ
type Messages struct {
	Errors  map[string]string `json:"errors"`
	Success map[string]string `json:"success"`
}

var (
	messagesJA Messages
	messagesEN Messages
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

// loadMessages - ロケールファイルを読み込む
func loadMessages(locale string, msgs *Messages) error {
	// アセットパスの構築
	assetPath := "internal/i18n/locales" + locale + ".json"

	data, err := os.ReadFile(assetPath)
	if err != nil {
		log.Printf("Warning: failed to read i18n file %s: %v\n", assetPath, err)
		// デフォルト値を設定
		msgs.Errors = make(map[string]string)
		msgs.Success = make(map[string]string)
		return nil
	}

	if err := json.Unmarshal(data, msgs); err != nil {
		return err
	}

	return nil
}

// GetErrorMessage - エラーメッセージを取得
func GetErrorMessage(locale, key string) string {
	msgs := selectLocale(locale)
	if msg, ok := msgs.Errors[key]; ok {
		return msg
	}
	// キーが見つからない場合は英語のフォールバック
	if msg, ok := messagesEN.Errors[key]; ok {
		return msg
	}
	return "An error occurred"
}

// GetSuccessMessage - 成功メッセージを取得
func GetSuccessMessage(locale, key string) string {
	msgs := selectLocale(locale)
	if msg, ok := msgs.Success[key]; ok {
		return msg
	}
	// キーが見つからない場合は英語のフォールバック
	if msg, ok := messagesEN.Success[key]; ok {
		return msg
	}
	return "Success"
}

// selectLocale - ロケールを選択
func selectLocale(locale string) *Messages {
	// Accept-Language ヘッダーから最初の言語コードを取得
	// "ja-JP,ja;q=0.9,en;q=0.8" -> "ja"
	parts := strings.Split(locale, ",")
	if len(parts) > 0 {
		locale = parts[0]
	}
	locale = strings.Split(locale, ";")[0]
	locale = strings.Split(locale, "-")[0]
	locale = strings.ToLower(strings.TrimSpace(locale))

	if locale == "ja" || strings.HasPrefix(locale, "ja") {
		return &messagesJA
	}
	return &messagesEN
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
