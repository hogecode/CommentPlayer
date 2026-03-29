package service

import (
	"encoding/json"
	"encoding/xml"
	"os"
	"strconv"
	"strings"
	"time"
)

// ChatXML - XMLコメント形式
type ChatXML struct {
	XMLName   xml.Name `xml:"chat"`
	Thread    string   `xml:"thread,attr"`
	No        string   `xml:"no,attr"`
	VPos      string   `xml:"vpos,attr"`
	Date      string   `xml:"date,attr"`
	DateUsec  string   `xml:"date_usec,attr"`
	Mail      string   `xml:"mail,attr"`
	UserID    string   `xml:"user_id,attr"`
	Premium   string   `xml:"premium,attr"`
	Anonymity string   `xml:"anonymity,attr"`
	Content   string   `xml:",chardata"`
}

// PacketXML - XMLファイルのルート要素
type PacketXML struct {
	XMLName xml.Name  `xml:"packet"`
	Chats   []ChatXML `xml:"chat"`
}

// ChatJSON - JSONコメント形式
type ChatJSON struct {
	Thread    string `json:"thread"`
	No        string `json:"no"`
	VPos      string `json:"vpos"`
	Date      string `json:"date"`
	DateUsec  string `json:"date_usec"`
	Mail      string `json:"mail"`
	UserID    string `json:"user_id"`
	Premium   string `json:"premium"`
	Anonymity string `json:"anonymity"`
	Content   string `json:"content"`
}

// PacketItemJSON - JSONパケットアイテム
type PacketItemJSON struct {
	Chat ChatJSON `json:"chat"`
}

// PacketJSONRoot - JSONファイルのルート構造
type PacketJSONRoot struct {
	Packet []PacketItemJSON `json:"packet"`
}

// CommentData - 統一されたコメントデータ
type CommentData struct {
	Count      int
	OldestDate time.Time
	NewestDate time.Time
}

// ParseCommentFile - コメントファイルをパースして情報を取得
func ParseCommentFile(filePath string) (*CommentData, error) {
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	// JSONとしてパース試行
	if commentData, err := parseJSON(fileBytes); err == nil && commentData != nil {
		return commentData, nil
	}

	// XMLとしてパース試行
	if commentData, err := parseXML(fileBytes); err == nil && commentData != nil {
		return commentData, nil
	}

	return nil, nil
}

// parseXML - XMLコメントファイルをパース
func parseXML(data []byte) (*CommentData, error) {
	var packet PacketXML
	if err := xml.Unmarshal(data, &packet); err != nil {
		return nil, err
	}

	if len(packet.Chats) == 0 {
		return &CommentData{Count: 0}, nil
	}

	// 最初と最後のコメントの日付を取得
	oldestDate := extractDate(packet.Chats[0].Date)
	newestDate := oldestDate

	for _, chat := range packet.Chats {
		date := extractDate(chat.Date)
		if date.Before(oldestDate) {
			oldestDate = date
		}
		if date.After(newestDate) {
			newestDate = date
		}
	}

	return &CommentData{
		Count:      len(packet.Chats),
		OldestDate: oldestDate,
		NewestDate: newestDate,
	}, nil
}

// parseJSON - JSONコメントファイルをパース
func parseJSON(data []byte) (*CommentData, error) {
	var root PacketJSONRoot
	if err := json.Unmarshal(data, &root); err != nil {
		return nil, err
	}

	if len(root.Packet) == 0 {
		return &CommentData{Count: 0}, nil
	}

	// 最初と最後のコメントの日付を取得
	oldestDate := extractDate(root.Packet[0].Chat.Date)
	newestDate := oldestDate

	for _, item := range root.Packet {
		date := extractDate(item.Chat.Date)
		if date.Before(oldestDate) {
			oldestDate = date
		}
		if date.After(newestDate) {
			newestDate = date
		}
	}

	return &CommentData{
		Count:      len(root.Packet),
		OldestDate: oldestDate,
		NewestDate: newestDate,
	}, nil
}

// extractDate - UNIXタイムスタンプから時刻を取得
func extractDate(dateStr string) time.Time {
	if dateStr == "" {
		return time.Now()
	}

	timestamp, err := strconv.ParseInt(dateStr, 10, 64)
	if err != nil {
		return time.Now()
	}

	return time.Unix(timestamp, 0).UTC()
}

// ParseCommentStructure - Syobocal XML Comment を JSON に構造化
// XML形式: *セクション -項目1 -項目2 *セクション2 ...
func ParseCommentStructure(xmlComment string) map[string]interface{} {
	if xmlComment == "" {
		return make(map[string]interface{})
	}

	result := make(map[string]interface{})
	lines := strings.Split(xmlComment, "\n")

	var currentSection string
	var currentItems []string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if strings.HasPrefix(line, "*") {
			// 新しいセクション
			if currentSection != "" && len(currentItems) > 0 {
				result[currentSection] = currentItems
			}
			currentSection = strings.TrimPrefix(line, "*")
			currentItems = []string{}
		} else if strings.HasPrefix(line, "-") {
			// セクション内の項目
			item := strings.TrimPrefix(line, "-")
			currentItems = append(currentItems, strings.TrimSpace(item))
		}
	}

	// 最後のセクションを追加
	if currentSection != "" && len(currentItems) > 0 {
		result[currentSection] = currentItems
	}

	return result
}

// ParseSubtitles - Syobocal XML SubTitles を JSON配列に構造化
// XML形式: *01*タイトル *02*タイトル ...
func ParseSubtitles(xmlSubtitles string) []map[string]interface{} {
	if xmlSubtitles == "" {
		return []map[string]interface{}{}
	}

	result := []map[string]interface{}{}
	lines := strings.Split(xmlSubtitles, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// *##* という形式を探す
		if strings.HasPrefix(line, "*") {
			// 最初の * を削除
			line = strings.TrimPrefix(line, "*")
			parts := strings.SplitN(line, "*", 2)

			if len(parts) == 2 {
				episodeNum := strings.TrimSpace(parts[0])
				title := strings.TrimSpace(parts[1])

				result = append(result, map[string]interface{}{
					"episode": episodeNum,
					"title":   title,
				})
			}
		}
	}

	return result
}
