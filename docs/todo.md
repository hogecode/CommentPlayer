
### 全般

- [ ] SPAに移行した後処理(Dockerとcaddy)
- [ ] .devcontainerを確認
- [ ] Caddyでリバプロ動かせるようにする
- [ ] docker-compose.yamlを確認
- [ ] Makefileを確認
- [ ] サーバー側でopenapi生成→フロント生成の流れ
- [ ] CLAUDE.md修正


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
- [ ] ヘッダー
- [ ] サイドバー
- [ ]
- [ ]
- [ ]
 
**画面**
- [ ] /videos: 動画
- [ ] /videos/:id
- [ ] /watched-history: 視聴履歴
- [ ] /captures: キャプチャ
- [ ] /captures/:id
- [ ] /settings

**追加処理**
- [ ] NG機能


### サーバー側

**全般**
- [ ] 起動時の処理
- [ ] バックエンドのviperの設定(yaml)
- [ ] .air.toml設定
- [ ] cobraファイル分ける
- 
**フォルダ変更時の処理**
- [ ]

**API**
**ビデオ一覧**
- [ ] GET /api/v1/videos
- [ ] GET /api/v1/videos/search
- [ ] GET /api/v1/videos/:id/download

**サムネ**
- [ ] GET /api/v1/videos/:id/thumbnail
- [ ] POST /api/v1/videos/:id/thumbnail/regenerate

**ビデオ視聴(実況)**
- [ ] GET /api/v1/videos/:id

**キャプチャ**
- [ ] GET /api/v1/captures
- [ ] POST /api/v1/captures

**DB**
- [ ] GORMでテーブル作成


