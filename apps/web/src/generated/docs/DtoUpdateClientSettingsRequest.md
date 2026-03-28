# DtoUpdateClientSettingsRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**close_comment_form_after_sending** | **boolean** |  | [optional] [default to undefined]
**comment_font_size** | **number** |  | [optional] [default to undefined]
**comment_speed_rate** | **number** | コメント設定 | [optional] [default to undefined]
**default_comment_color** | **string** |  | [optional] [default to undefined]
**last_synced_at** | **number** | Unix timestamp (ms) | [optional] [default to undefined]
**max_comments_display_count** | **number** |  | [optional] [default to undefined]
**mute_abusive_discriminatory_prejudiced_comments** | **boolean** |  | [optional] [default to undefined]
**mute_big_size_comments** | **boolean** |  | [optional] [default to undefined]
**mute_colored_comments** | **boolean** |  | [optional] [default to undefined]
**mute_comment_keywords_normalize_alphanumeric_width_case** | **boolean** |  | [optional] [default to undefined]
**mute_consecutive_same_characters_comments** | **boolean** |  | [optional] [default to undefined]
**mute_fixed_comments** | **boolean** | コメントNG設定 | [optional] [default to undefined]
**mute_vulgar_comments** | **boolean** |  | [optional] [default to undefined]
**muted_comment_keywords** | [**Array&lt;DtoMutedCommentKeyword&gt;**](DtoMutedCommentKeyword.md) |  | [optional] [default to undefined]
**muted_niconico_user_ids** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**mylist** | [**Array&lt;DtoMylistItem&gt;**](DtoMylistItem.md) | マイリスト情報 | [optional] [default to undefined]
**sync_settings** | **boolean** | 設定の同期 | [optional] [default to undefined]
**video_watched_history_max_count** | **number** | 動画履歴 | [optional] [default to undefined]
**watched_history** | [**Array&lt;DtoWatchedHistoryItem&gt;**](DtoWatchedHistoryItem.md) | 動画視聴履歴 | [optional] [default to undefined]

## Example

```typescript
import { DtoUpdateClientSettingsRequest } from './api';

const instance: DtoUpdateClientSettingsRequest = {
    close_comment_form_after_sending,
    comment_font_size,
    comment_speed_rate,
    default_comment_color,
    last_synced_at,
    max_comments_display_count,
    mute_abusive_discriminatory_prejudiced_comments,
    mute_big_size_comments,
    mute_colored_comments,
    mute_comment_keywords_normalize_alphanumeric_width_case,
    mute_consecutive_same_characters_comments,
    mute_fixed_comments,
    mute_vulgar_comments,
    muted_comment_keywords,
    muted_niconico_user_ids,
    mylist,
    sync_settings,
    video_watched_history_max_count,
    watched_history,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
