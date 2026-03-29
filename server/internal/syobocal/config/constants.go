package config

import (
	"time"

	"github.com/hogecode/commentPlayer/internal/syobocal/models"
)

// JST is Japan Standard Time (UTC+9)
var JST = time.FixedZone("JST", 9*60*60)

// API endpoints
const (
	SyoboiTitleSearchURL = "http://cal.syoboi.jp/json"
	SyoboiProgLookupURL  = "http://cal.syoboi.jp/db"
	JikkyoBaseURL        = "https://jikkyo.tsukumijima.net/api/kakolog"
)

// NewChannelMapping creates and returns a complete channel mapping
func NewChannelMapping() models.ChannelMapping {
	return models.ChannelMapping{
		"NHK総合":    {ChID: 1, ChGID: 11, ChName: "NHK総合", JikkyoID: "jk1"},
		"NHK Eテレ":  {ChID: 2, ChGID: 11, ChName: "NHK Eテレ", JikkyoID: "jk2"},
		"フジテレビ":    {ChID: 3, ChGID: 1, ChName: "フジテレビ", JikkyoID: "jk8"},
		"日本テレビ":    {ChID: 4, ChGID: 1, ChName: "日テレ１", JikkyoID: "jk4"},
		"TBS":      {ChID: 5, ChGID: 1, ChName: "ＴＢＳ１", JikkyoID: "jk6"},
		"テレビ朝日":    {ChID: 6, ChGID: 1, ChName: "テレビ朝日", JikkyoID: "jk5"},
		"テレビ東京":    {ChID: 7, ChGID: 1, ChName: "テレビ東京１", JikkyoID: "jk7"},
		"tvk":      {ChID: 8, ChGID: 1, ChName: "tvk", JikkyoID: "jk11"},
		"TOKYO MX": {ChID: 19, ChGID: 1, ChName: "ＴＯＫＹＯ　ＭＸ１", JikkyoID: "jk9"},
	}
}

// TimeFormat is the standard time format used for output
const TimeFormat = "2006-01-02 15:04:05"

// IsPopularChannel checks if a JikkyoID is for a popular/widely-supported channel (jk1-jk9)
// These channels have better comment availability and wider Jikkyo support
func IsPopularChannel(jikkyoID string) bool {
	// jk1 to jk9 are the main terrestrial/ground wave channels
	return jikkyoID == "jk1" || jikkyoID == "jk2" || jikkyoID == "jk4" ||
		jikkyoID == "jk5" || jikkyoID == "jk6" || jikkyoID == "jk7" ||
		jikkyoID == "jk8" || jikkyoID == "jk9"
}
