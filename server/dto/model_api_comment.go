package dto

type ApiComment struct {

	// コメント時刻（秒）
	Time float32 `json:"time"`

	// コメント表示位置
	Type string `json:"type"`

	// コメントサイズ
	Size string `json:"size"`

	// コメント色
	Color string `json:"color"`

	// コメント作成者
	Author string `json:"author,omitempty"`

	// コメント本文
	Text string `json:"text"`
}
