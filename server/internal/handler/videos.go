package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/hogecode/commentPlayer/internal/db"
	"github.com/hogecode/commentPlayer/internal/dto"
	"github.com/hogecode/commentPlayer/internal/entity"
	"github.com/hogecode/commentPlayer/internal/i18n"
	"github.com/hogecode/commentPlayer/internal/service"
	"github.com/hogecode/commentPlayer/internal/syobocal/config"
	"github.com/hogecode/commentPlayer/internal/syobocal/models"
)

// RegisterVideoRoutes - ビデオ関連ルートを登録
// @title commentPlayer API
// @version 1.0.0
// @description ビデオ管理アプリケーションのREST API
// @host localhost:8000
// @basePath /
func (a *App) RegisterVideoRoutes(videosGroup *gin.RouterGroup) {
	a.GetVideos(videosGroup)
	a.GetVideoYears(videosGroup) // /:idより前に登録して、/yearsが/:idに引っかからないようにする
	a.SearchVideos(videosGroup)  // /searchも/:idより前に登録
	a.RecordVideoView(videosGroup) // /:idより前に登録
	a.GetVideoByID(videosGroup)  // 可変パラメータは最後に登録
	a.DownloadVideo(videosGroup)
	a.RegenerateThumbnail(videosGroup)
}

// GetVideos - ビデオ一覧を取得
// @Summary ビデオ一覧を取得
// @Description ページネーション対応のビデオ一覧を取得します。IDsはコンマ区切りで複数指定可能です
// @Tags Videos
// @Param ids query string false "ビデオID（複数指定可能、コンマ区切り、例："103,102"）"
// @Param filterBy query string false "フィルター"
// @Param year query integer false "年フィルター（例：2023）"
// @Param page query integer false "ページ番号" default(1)
// @Param limit query integer false "1ページあたりのアイテム数" default(20)
// @Param sort query string false "ソート対象フィールド" default(created_at)
// @Param order query string false "ソート順序" default(desc)
// @Produce json
// @Success 200 {object} dto.VideoListResponse
// @Failure 422 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos [get]
func (a *App) GetVideos(videosGroup *gin.RouterGroup) {
	videosGroup.GET("", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.VideoListRequest
		if err := ctx.ShouldBindQuery(&req); err != nil {
			ctx.JSON(http.StatusUnprocessableEntity, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// デフォルト値を設定
		req.SetDefaults()

		// バリデーション
		if err := a.Validator.Struct(req); err != nil {
			ctx.JSON(http.StatusUnprocessableEntity, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// IDsをstring から[]intにパース（コンマ区切り形式に対応）
		var ids []int
		if req.IDs != "" {
			// コンマで分割
			idStrs := strings.Split(req.IDs, ",")
			for _, idStr := range idStrs {
				idStr = strings.TrimSpace(idStr)
				if idStr != "" {
					if id, err := strconv.Atoi(idStr); err == nil {
						ids = append(ids, id)
					}
				}
			}
		}

		// DB処理をqueryパッケージに委譲
		// req.Yearはポインタなので、値がある場合だけ渡す
		year := 0
		if req.Year != nil {
			year = *req.Year
		}
		videos, total, err := a.VideoQuery.GetVideoList(ids, req.FilterBy, year, req.Page, req.Limit, req.Sort, req.Order)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_videos"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		totalPages := (int(total) + req.Limit - 1) / req.Limit
		ctx.JSON(http.StatusOK, dto.VideoListResponse{
			Data: videos,
			Pagination: dto.Pagination{
				Page:       req.Page,
				Limit:      req.Limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})
}

// GetVideoYears - ビデオの年一覧を取得
// @Summary ビデオの年一覧を取得
// @Description jikkyo_dateから抽出した年の一覧を降順で返します
// @Tags Videos
// @Produce json
// @Success 200 {object} dto.VideoYearsResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/years [get]
func (a *App) GetVideoYears(videosGroup *gin.RouterGroup) {
	videosGroup.GET("/years", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// DB処理をqueryパッケージに委譲
		years, err := a.VideoQuery.GetVideoYears()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_fetch_videos"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		ctx.JSON(http.StatusOK, dto.VideoYearsResponse{
			Data: years,
		})
	})
}

// SearchVideos - ビデオを検索
// @Summary ビデオを検索
// @Description キーワードでビデオを検索します
// @Tags Videos
// @Param q query string true "検索キーワード"
// @Param page query int false "ページ番号" default(1)
// @Param limit query int false "1ページあたりのアイテム数" default(20)
// @Param order query string false "ソート順序" default(desc)
// @Param filterBy query string false "フィルター"
// @Produce json
// @Success 200 {object} dto.VideoListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/search [get]
func (a *App) SearchVideos(videosGroup *gin.RouterGroup) {
	videosGroup.GET("/search", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		var req dto.VideoSearchRequest
		if err := ctx.ShouldBindQuery(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// デフォルト値を設定
		req.SetDefaults()

		// バリデーション
		if err := a.Validator.Struct(req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_query_params"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		videos, total, err := a.VideoQuery.SearchVideos(req.Q, req.Page, req.Limit, req.Order, req.FilterBy)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_search_videos"),
				Code:  "INTERNAL_ERROR",
			})
			return
		}

		// レスポンス
		totalPages := (int(total) + req.Limit - 1) / req.Limit
		ctx.JSON(http.StatusOK, dto.VideoListResponse{
			Data: videos,
			Pagination: dto.Pagination{
				Page:       req.Page,
				Limit:      req.Limit,
				Total:      int(total),
				TotalPages: totalPages,
			},
		})
	})
}

// GetVideoByID - ビデオ詳細を取得
// @Summary ビデオ詳細を取得
// @Description 特定のビデオの詳細情報を取得します
// @Tags Videos
// @Param id path int true "ビデオID"
// @Produce json
// @Success 200 {object} entity.Video
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/{id} [get]
func (a *App) GetVideoByID(videosGroup *gin.RouterGroup) {
	videosGroup.GET("/:id", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				// TODO: i18n.Tに変換
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				// TODO: i18n.Tに変換
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// コメントファイルを取得してApiComment[]に変換
		// XMLファイル→ニコ実の順で取得を試みている
		comments := a.getCommentsFromFile(video.FilePath, video)

		// FilePath を URL に変換
		// http://localhost:8000/api/v1/files/{folderID}/{fileName} のような形式
		videoURL := a.buildVideoURL(video.FolderID, video.FileName)

		response := &dto.VideoResponse{
			Video:    video,
			Src:      videoURL,
			Comments: comments,
		}
		ctx.JSON(http.StatusOK, response)
	})
}

// DownloadVideo - ビデオをダウンロード
// @Summary ビデオをダウンロード
// @Description ビデオファイルをダウンロードします
// @Tags Videos
// @Param id path int true "ビデオID"
// @Produce octet-stream
// @Success 200 {file} file
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/{id}/download [get]
func (a *App) DownloadVideo(videosGroup *gin.RouterGroup) {
	videosGroup.GET("/:id/download", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// ファイルをダウンロード（実装は省略 - FilePath から実際のファイルを提供）
		ctx.FileAttachment(video.FilePath, "video.mp4")
	})
}

// RegenerateThumbnail - サムネイルを再生成
// @Summary サムネイルを再生成
// @Description ビデオのサムネイルを再生成します
// @Tags Videos
// @Param id path int true "ビデオID"
// @Param body body dto.ThumbnailRegenerateRequest false "リクエストボディ"
// @Produce json
// @Success 200 {object} dto.ThumbnailRegenerateResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/{id}/thumbnail/regenerate [post]
func (a *App) RegenerateThumbnail(videosGroup *gin.RouterGroup) {
	videosGroup.POST("/:id/thumbnail/regenerate", func(ctx *gin.Context) {
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		idStr := ctx.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		var req dto.ThumbnailRegenerateRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_request_body"),
				Code:  "VALIDATION_ERROR",
			})
			return
		}

		// DB処理をqueryパッケージに委譲
		video, err := a.VideoQuery.GetVideoByID(id)
		if err != nil {
			ctx.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "video_not_found"),
				Code:  "NOT_FOUND",
			})
			return
		}

		// ビデオファイルが存在するか確認
		if _, err := os.Stat(video.FilePath); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_regenerate_thumbnail"),
				Code:  "FILE_NOT_FOUND",
			})
			return
		}

		// サムネイル出力ディレクトリを取得（Configで管理）
		screenshotDir := a.Config.Storage.ScreenshotsDir

		// ディレクトリが存在しなければ作成
		if err := os.MkdirAll(screenshotDir, 0755); err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_regenerate_thumbnail"),
				Code:  "DIRECTORY_CREATE_ERROR",
			})
			return
		}

		// サムネイル再生成ロジック
		screenshotFileName, err := service.CaptureScreenshot(video.FilePath, screenshotDir)
		if err != nil || screenshotFileName == nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_regenerate_thumbnail"),
				Code:  "THUMBNAIL_GENERATION_ERROR",
			})
			return
		}

		// ThumbnailInfo を更新
		// リクエストから幅・高さが指定されていればそれを使用、なければデフォルト値を設定
		// TODO: サムネイル画像の実際のサイズを取得して設定するようにする
		// TODO: 画像を小さくして、WEBP形式で保存するようにする
		width := 1280 // デフォルト幅
		height := 720 // デフォルト高さ

		if req.Width != nil && *req.Width > 0 {
			width = *req.Width
		}
		if req.Height != nil && *req.Height > 0 {
			height = *req.Height
		}

		video.ThumbnailInfo = &entity.ThumbnailInfo{
			Width:       width,
			Height:      height,
			GeneratedAt: time.Now(),
		}

		// スクリーンショットファイルパスを更新
		video.ScreenshotFilePath = screenshotFileName

		// DBに保存
		if err := a.DB.Save(video).Error; err != nil {
			ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "failed_save_video"),
				Code:  "DATABASE_ERROR",
			})
			return
		}

		ctx.JSON(http.StatusOK, dto.ThumbnailRegenerateResponse{
			ID:            video.ID,
			ThumbnailInfo: video.ThumbnailInfo,
			Message:       i18n.GetSuccessMessage(locale, "thumbnail_regenerated"),
		})
	})
}

// getCommentsFromFile - ビデオファイルに対応するコメントファイルを取得してApiCommentに変換
// コメントファイルがなく、videoテーブルの該当レコードの
// channel_id、prog_start_time、prog_end_timeが存在する場合は、
// ニコニコ実況からコメントを取得して返す
func (a *App) getCommentsFromFile(videoFilePath string, video *entity.Video) []dto.ApiComment {
	baseFileName := service.GetBaseFileName(filepath.Base(videoFilePath))
	folderPath := filepath.Dir(videoFilePath)

	// XMLまたはJSONのコメントファイルを探す
	commentExtensions := []string{".xml", ".json"}
	for _, ext := range commentExtensions {
		commentPath := filepath.Join(folderPath, baseFileName+ext)
		if _, err := os.Stat(commentPath); err == nil {
			comments, err := a.convertCommentsToAPI(commentPath)
			if err != nil {
				slog.Error("Failed to convert comments to API format", "error", err, "path", commentPath)
			}
			if err == nil && comments != nil {
				return comments
			}
		}
	}

	// ローカルファイルがない場合、ニコニコ実況からコメント取得を試みる
	if video != nil && video.ChannelID != nil && video.ProgStartTime != nil && video.ProgEndTime != nil {
		comments := a.getCommentsFromJikkyo(video, baseFileName, folderPath)
		if comments != nil {
			return comments
		}
	}

	return []dto.ApiComment{}
}

// convertCommentsToAPI - コメントファイルをApiCommentに変換
func (a *App) convertCommentsToAPI(commentPath string) ([]dto.ApiComment, error) {
	fileBytes, err := os.ReadFile(commentPath)
	if err != nil {
		return nil, err
	}

	// JSONとしてパース試行
	if comments, err := a.convertJSONCommentsToAPI(fileBytes); err == nil && comments != nil {
		return comments, nil
	}

	// XMLとしてパース試行
	if comments, err := a.convertXMLCommentsToAPI(fileBytes); err == nil && comments != nil {
		return comments, nil
	}

	return nil, nil
}

// convertXMLCommentsToAPI - XMLコメントをApiCommentに変換
func (a *App) convertXMLCommentsToAPI(data []byte) ([]dto.ApiComment, error) {
	var packet service.PacketXML
	if err := xml.Unmarshal(data, &packet); err != nil {
		return nil, err
	}

	if len(packet.Chats) == 0 {
		return []dto.ApiComment{}, nil
	}

	comments := make([]dto.ApiComment, 0, len(packet.Chats))
	for _, chat := range packet.Chats {
		comment := a.chatXMLToApiComment(chat)
		comments = append(comments, comment)
	}

	return comments, nil
}

// convertJSONCommentsToAPI - JSONコメントをApiCommentに変換
func (a *App) convertJSONCommentsToAPI(data []byte) ([]dto.ApiComment, error) {
	var root service.PacketJSONRoot
	if err := json.Unmarshal(data, &root); err != nil {
		return nil, err
	}

	if len(root.Packet) == 0 {
		return []dto.ApiComment{}, nil
	}

	comments := make([]dto.ApiComment, 0, len(root.Packet))
	for _, item := range root.Packet {
		comment := a.chatJSONToApiComment(item.Chat)
		comments = append(comments, comment)
	}

	return comments, nil
}

// chatXMLToApiComment - ChatXMLをApiCommentに変換
func (a *App) chatXMLToApiComment(chat service.ChatXML) dto.ApiComment {
	// vpos（ビデオ位置）を秒単位の浮動小数点数に変換
	time := float64(0)
	if chat.VPos != "" {
		if vpos, err := strconv.ParseInt(chat.VPos, 10, 64); err == nil {
			time = float64(vpos) / 100.0 // vposは10ミリ秒単位
		}
	}

	// mailフィールドからコメント表示スタイルを解析
	commentType, commentSize, commentColor := a.parseMailAttribute(chat.Mail)

	// UserIDがある場合は表示、ない場合はnil
	var author *string
	if chat.UserID != "" && chat.Anonymity != "1" {
		author = &chat.UserID
	}

	return dto.ApiComment{
		Time:   time,
		Type:   commentType,
		Size:   commentSize,
		Color:  commentColor,
		Author: author,
		Text:   chat.Content,
	}
}

// chatJSONToApiComment - ChatJSONをApiCommentに変換
func (a *App) chatJSONToApiComment(chat service.ChatJSON) dto.ApiComment {
	// vpos（ビデオ位置）を秒単位の浮動小数点数に変換
	time := float64(0)
	if chat.VPos != "" {
		if vpos, err := strconv.ParseInt(chat.VPos, 10, 64); err == nil {
			time = float64(vpos) / 100.0 // vposは10ミリ秒単位
		}
	}

	// mailフィールドからコメント表示スタイルを解析
	commentType, commentSize, commentColor := a.parseMailAttribute(chat.Mail)

	// UserIDがある場合は表示、ない場合はnil
	var author *string
	if chat.UserID != "" && chat.Anonymity != "1" {
		author = &chat.UserID
	}

	return dto.ApiComment{
		Time:   time,
		Type:   commentType,
		Size:   commentSize,
		Color:  commentColor,
		Author: author,
		Text:   chat.Content,
	}
}

// parseMailAttribute - mailフィールドからコメント表示スタイルを解析
// ニコニコ動画形式のmail属性を DPlayer 形式に変換
// mail="184 naka medium white" のように複数の属性がスペース区切りで指定される
// 位置指定: ue=top, naka=right, shita=bottom
// サイズ指定: small, medium, big
// 色指定: ニコニコ色名（white, red, cyan等）または16進数カラーコード（#xxxxxx形式）
// ※色名は16進数コードに変換せず、そのままフロントエンドに返す
func (a *App) parseMailAttribute(mail string) (commentType, commentSize, commentColor string) {
	// デフォルト値
	commentType = "right"  // デフォルトは右
	commentSize = "medium" // デフォルトは中
	commentColor = "white" // デフォルトは白

	if mail == "" {
		return
	}

	// mailを空白で分割
	parts := strings.Fields(mail)
	for _, part := range parts {
		switch part {
		// 位置指定
		case "ue":
			commentType = "top"
		case "naka":
			commentType = "right"
		case "shita":
			commentType = "bottom"
		// サイズ指定
		case "small":
			commentSize = "small"
		case "medium":
			commentSize = "medium"
		case "big":
			commentSize = "big"
		// 色指定（色名または16進数コード）
		default:
			// 16進数カラーコード（#xxxxxx形式）、またはニコニコ色名をそのまま返す
			commentColor = part
		}
	}

	return
}

// getCommentsFromJikkyo - ニコニコ実況からコメントを取得して変換
// XMLファイルと同時に、コメント数と最古日時をDBに保存する
func (a *App) getCommentsFromJikkyo(video *entity.Video, baseFileName string, folderPath string) []dto.ApiComment {
	if a.JikkyoClient == nil {
		return nil
	}

	// ChannelIDからJikkyoIDへマッピング
	channelMapping := config.NewChannelMapping()
	jikkyoID := ""
	for _, ch := range channelMapping {
		if ch.ChID == *video.ChannelID {
			jikkyoID = ch.JikkyoID
			break
		}
	}

	if jikkyoID == "" {
		// マッピングが見つからない場合は処理を中止
		return nil
	}

	// UNIXタイムスタンプに変換
	// video.ProgStartTimeとvideo.ProgEndTimeをUTCに変換
	// +0900 JST を UTC に変換する例:
	startTime := video.ProgStartTime.Add(-9 * time.Hour).Unix()
	endTime := video.ProgEndTime.Add(-9 * time.Hour).Unix()

	// XML形式でコメント取得
	slog.Info("Fetching comments from Jikkyo API",
		slog.String("jikkyo_id", jikkyoID),
		slog.Int64("start_time", startTime),
		slog.Int64("end_time", endTime),
	)
	packet, xmlBytes, err := a.JikkyoClient.GetJikkyoCommentsXML(jikkyoID, startTime, endTime)
	if err != nil || packet == nil {
		// API呼び出し失敗時は空配列を返す
		slog.Error("Failed to fetch comments from Jikkyo API",
			slog.String("jikkyo_id", jikkyoID),
			slog.Any("error", err),
		)
		return []dto.ApiComment{}
	}

	// Normalize vpos values: set the first comment's vpos to 0 and adjust all others accordingly
	if len(packet.Chats) > 0 {
		firstVpos, err := strconv.ParseInt(packet.Chats[0].Vpos, 10, 64)
		if err == nil && firstVpos > 0 {
			for i := range packet.Chats {
				currentVpos, err := strconv.ParseInt(packet.Chats[i].Vpos, 10, 64)
				if err == nil {
					normalizedVpos := currentVpos - firstVpos
					packet.Chats[i].Vpos = fmt.Sprintf("%d", normalizedVpos)
				}
			}
		}
	}

	// XMLファイルを保存（エラー時はスキップ）
	// 正規化されたデータを反映させるため、packetを再度XMLにマーシャル
	normalizedXmlBytes, marshalErr := xml.MarshalIndent(packet, "", "  ")
	if marshalErr == nil {
		xmlBytes = normalizedXmlBytes
	}
	
	commentPath := filepath.Join(folderPath, baseFileName+".xml")
	if err := os.WriteFile(commentPath, xmlBytes, 0644); err != nil {
		slog.Warn("Failed to save comment XML file",
			slog.String("path", commentPath),
			slog.Any("error", err),
		)
	} else {
		slog.Info("Comment XML file saved successfully",
			slog.String("path", commentPath),
		)
	}

	// コメント数と最古日時をDBに保存
	commentCount := len(packet.Chats)
	if commentCount > 0 && a.Queries != nil {
		// 最古日時を取得（最初のチャットの日時）
		if oldestDateStr, err := strconv.ParseInt(packet.Chats[0].Date, 10, 64); err == nil {
			oldestDateTime := time.Unix(oldestDateStr, 0)

			// sqlc生成メソッドを使用してVideoテーブルを更新
			updateErr := a.Queries.UpdateVideoJikkyoMetadata(context.Background(), db.UpdateVideoJikkyoMetadataParams{
				JikkyoCommentCount: sql.NullInt64{Int64: int64(commentCount), Valid: true},
				JikkyoDate:         sql.NullTime{Time: oldestDateTime, Valid: true},
				UpdatedAt:          sql.NullTime{Time: time.Now(), Valid: true},
				ID:                 int64(video.ID),
			})

			if updateErr != nil {
				slog.Warn("Failed to update video Jikkyo metadata",
					slog.Int("video_id", video.ID),
					slog.Int("comment_count", commentCount),
					slog.Any("error", updateErr),
				)
			} else {
				slog.Info("Video Jikkyo metadata updated successfully",
					slog.Int("video_id", video.ID),
					slog.Int("comment_count", commentCount),
					slog.String("jikkyo_date", oldestDateTime.String()),
				)
			}
		}
	}

	// コメントを変換
	comments := make([]dto.ApiComment, 0, len(packet.Chats))
	for _, chat := range packet.Chats {
		comment := a.chatJikkyoXMLToApiComment(chat)
		comments = append(comments, comment)
	}
	return comments
}

// chatJikkyoXMLToApiComment - JikkiyoChatXMLをApiCommentに変換
func (a *App) chatJikkyoXMLToApiComment(chat models.JikkyoChatXML) dto.ApiComment {
	// vpos（ビデオ位置）を秒単位の浮動小数点数に変換
	time := float64(0)
	if chat.Vpos != "" {
		if vpos, err := strconv.ParseInt(chat.Vpos, 10, 64); err == nil {
			time = float64(vpos) / 100.0 // vposは10ミリ秒単位
		}
	}

	// mailフィールドからコメント表示スタイルを解析
	commentType, commentSize, commentColor := a.parseMailAttribute(chat.Mail)

	// UserIDがある場合は表示、ない場合はnil
	var author *string
	if chat.UserID != "" && chat.Anonymity != "1" {
		author = &chat.UserID
	}

	return dto.ApiComment{
		Time:   time,
		Type:   commentType,
		Size:   commentSize,
		Color:  commentColor,
		Author: author,
		Text:   chat.Content,
	}
}

// buildVideoURL - ファイルパスをURL に変換
// フォルダID とファイル名から、http://localhost:8000/api/v1/files/{folderID}/{fileName} のような形式の URL を構築
func (a *App) buildVideoURL(folderID int, fileName string) string {
	return "/api/v1/files/" + strconv.Itoa(folderID) + "/" + fileName
}

// RecordVideoView - ビデオの視聴を記録
// @Summary ビデオの視聴を記録
// @Description ビデオの視聴開始時に呼び出し、views を増加させ watched_history に行を追加します
// @Tags Videos
// @Param id path integer true "ビデオID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/v1/videos/{id}/view [post]
func (a *App) RecordVideoView(videosGroup *gin.RouterGroup) {
	videosGroup.POST("/:id/view", func(ctx *gin.Context) {
		// ロケール情報を取得
		locale := i18n.GetLocaleFromRequest(ctx.GetHeader("Accept-Language"))

		// ビデオID を取得
		idStr := ctx.Param("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: i18n.GetErrorMessage(locale, "invalid_video_id"),
				Code:  "INVALID_ID",
			})
			return
		}

		// 現在時刻をタイムスタンプとして使用
		now := time.Now()

		// views を増加
		if a.Queries != nil {
			if err := a.Queries.IncrementVideoViews(context.Background(), db.IncrementVideoViewsParams{
				UpdatedAt: sql.NullTime{Time: now, Valid: true},
				ID:        id,
			}); err != nil {
				slog.Error("Failed to increment video views",
					slog.Int64("video_id", id),
					slog.Any("error", err),
				)
				ctx.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error: i18n.GetErrorMessage(locale, "failed_record_view"),
					Code:  "DATABASE_ERROR",
				})
				return
			}
		}

		// watched_history に行を追加
		if a.Queries != nil {
			if err := a.Queries.CreateWatchedHistory(context.Background(), db.CreateWatchedHistoryParams{
				VideoID:   id,
				WatchedAt: sql.NullTime{Time: now, Valid: true},
			}); err != nil {
				slog.Error("Failed to create watched history record",
					slog.Int64("video_id", id),
					slog.Any("error", err),
				)
				// watched_history の失敗は警告レベルで、レスポンスは成功とする
			}
		}

		slog.Info("Video view recorded successfully",
			slog.Int64("video_id", id),
			slog.String("watched_at", now.String()),
		)

		ctx.JSON(http.StatusOK, dto.SuccessResponse{
			Message: i18n.GetSuccessMessage(locale, "video_view_recorded"),
		})
	})
}
