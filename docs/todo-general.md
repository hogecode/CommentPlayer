
### 全般

- [ ] CLAUDE.md編集


### クライアント側

**全般**
- [ ] 旧プロジェクトから移行できる部分は移行
- [ ] 
- [ ]
- [ ]

**Zustandストア**
- [ ]
- [ ]
- [ ]
- [ ]

**コンポーネント**
- [ ]
- [ ]
- [ ]
 
**画面**
- [ ] /videos: 動画一覧
- [ ] /videos/:id　視聴画面
- [ ] /watched-history: 視聴履歴
- [ ] /captures: キャプチャ
- [ ] /captures/:id　特定の画像
- [ ] /settings　設定

**追加処理**
- [ ] NG機能　設定から追加


### サーバー側

**全般**
- 
**フォルダ変更時の処理**
- [ ]

**API**
**ビデオ一覧**
- [x] GET /api/v1/videos
- [x] GET /api/v1/videos/search
- [ ] GET /api/v1/videos/:id/download

**サムネ**
- [ ] GET /api/v1/videos/:id/thumbnail
- [ ] POST /api/v1/videos/:id/thumbnail/regenerate

**ビデオ視聴(実況)**
- [x] GET /api/v1/videos/:id

**キャプチャ**
- [ ] GET /api/v1/captures
- [ ] POST /api/v1/captures

**DB**
- [x] SQLite初期化
