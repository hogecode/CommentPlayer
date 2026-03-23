

### 概要


### 前提条件

- goroutineで行う
- 使用ライブラリはfsnotify, ffmpeg(ラッパーライブラリを使用)
- プロジェクトのフォルダ構造に合うようにファイルを作成してください

### 動作フロー

**1. 設定ファイルからパスの取得**

Folderテーブルを作成し、そこに保存された複数の監視対象のフォルダのパスを取得する

**2. フォルダ内の動画とコメントファイルを取得する**

- folder
  - abc.mp4
  - abc.xml
  - def.mkv
  - def.json
  
フォルダから、mp4, mkvなどの形式の動画と、拡張子以外のファイル名が同じ.xmlあるいは.jsonファイルが存在する。
動画と同じ名前のコメントファイルがその動画に対応する弾幕表示するためのコメントファイル。

形式は以下のようになっている。

```xml
<?xml version="1.0" encoding="utf-8"?>
<packet>
  <chat thread="M.X_-K-mdQhroRYVXBSi5QnA" no="7267" vpos="29" date="1665241200" date_usec="289643" mail="184" user_id="zNJNm7uF_g-xeeeKqfXUB2D3xo4" anonymity="1">ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!</chat>
  <chat thread="M.X_-K-mdQhroRYVXBSi5QnA" no="7268" vpos="57" date="1665241200" date_usec="569490" mail="184" user_id="z1N1rH3hErdtpqAD8ewluCuKz7w" premium="1" anonymity="1">ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!</chat>
```

別バージョン
```xml
<chat thread="1606417201" no="2750" vpos="1440040" date="1606431601" mail="184" user_id="mmJyd4lCsV6e3loLXR0QvZnlnFI" premium="1" anonymity="1" date_usec="373180">六甲おろし歌って</chat>
```

JSONバージョン
```json
{
    "packet": [
        {
            "chat": {
                "thread": "1606417201",
                "no": "2750",
                "vpos": "1440040",
                "date": "1606431601",
                "mail": "184",
                "user_id": "mmJyd4lCsV6e3loLXR0QvZnlnFI",
                "premium": "1",
                "anonymity": "1",
                "date_usec": "373180",
                "content": "六甲おろし歌って"
            }
        },
        {
            "chat": {
                "thread": "1606417201",
                "no": "2751",
                "vpos": "1440136",
                "date": "1606431602",
                "mail": "184",
                "user_id": "Vz1E1ii0OXV1ApWddfG7niOSYak",
                "anonymity": "1",
                "date_usec": "183595",
                "content": "ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!"
            }
        },
```

**3. DBのビデオテーブルとフォルダ内容を同期する**

右にどのように値をファイルからDBに変換するか記載する。
もし、NOTNULL, デフォルト値等設定を変更する必要があるなら変更してください。
ここではFolderPathをVideoテーブルの中に入れているが、別途Folderテーブルを作成したい。
FolderPathフィールドを移行し、外部キーを使ってリレーションを持たせる。

```go
type Video struct {
	ID                  int            `gorm:"primaryKey" json:"id"` 
	FileName            string         `json:"file_name"` 
	FolderPath          string         `json:"-"`
	FilePath            string         `json:"-"`
	Description         *string        `json:"description"` // 今は使わない
	Status              string         `json:"status"` // 今は使わない
	FileHash            string         `json:"-"`      // 何かいい方法でハッシュを求める
	FileSize            int64          `json:"file_size"` // バイト単位で保存する
	JikkyoCommentCount  *int           `json:"jikkyo_comment_count"` // 上記のchatフィールドの個数、ファイルが存在しない場合は0
	JikkyoDate          *time.Time     `json:"jikkyo_date"` // 上記のchat.dateのUNIXTIMESTAMPから求める
	Views               int            `json:"views"` // デフォルトは0
	Liked               bool           `json:"liked"`
	ScreenshotFileName  *string        `json:"screenshot_file_path"` // ffmpegでスクショを撮り、特定の長さのランダム文字列を作成
	Duration            float64        `json:"duration"` // 秒数
	ThumbnailInfoJSON   json.RawMessage `gorm:"type:json" json:"-"` // {version: number, fileName: str}[]
	ThumbnailInfo       *ThumbnailInfo `gorm:"-" json:"thumbnail_info"`
    IsDeleted		    bool           `json:"is_deleted"` // 初期値はfalse
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}
```

監視対象のフォルダに**動画の**ファイルが追加された場合、ビデオレコードを追加。
xml, jsonのみ追加された場合は処理を行わない。
同じファイル名、同じフォルダIDでisDeletedがtrueのレコードがあった場合、isDeletedをfalseに戻す。
ファイルが削除された場合、isDeletedをtrueに変更。


**4. フォルダが削除された場合**

特定の監視対象のフォルダ自体が削除された場合、そのフォルダに該当するビデオレコードのisDeletedをtrueにする。

