# EntityVideo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**channel_id** | **number** | Syobocal チャンネルID（ChID） | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**duration** | **number** |  | [optional] [default to undefined]
**episode** | **number** | エピソード番号 | [optional] [default to undefined]
**file_name** | **string** |  | [optional] [default to undefined]
**file_size** | **number** |  | [optional] [default to undefined]
**folder_id** | **number** | Folderテーブルへの外部キー | [optional] [default to undefined]
**id** | **number** |  | [optional] [default to undefined]
**is_deleted** | **boolean** |  | [optional] [default to undefined]
**jikkyo_comment_count** | **number** |  | [optional] [default to undefined]
**jikkyo_date** | **string** |  | [optional] [default to undefined]
**liked** | **boolean** |  | [optional] [default to undefined]
**prog_end_time** | **string** | 放送終了時刻 | [optional] [default to undefined]
**prog_start_time** | **string** | 放送開始時刻 | [optional] [default to undefined]
**screenshot_file_path** | **string** |  | [optional] [default to undefined]
**series_id** | **number** | Seriesテーブルへの外部キー | [optional] [default to undefined]
**status** | **string** | ready, processing, error | [optional] [default to undefined]
**subtitle** | **string** | エピソードサブタイトル | [optional] [default to undefined]
**thumbnail_info** | [**EntityThumbnailInfo**](EntityThumbnailInfo.md) |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**views** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { EntityVideo } from './api';

const instance: EntityVideo = {
    channel_id,
    created_at,
    description,
    duration,
    episode,
    file_name,
    file_size,
    folder_id,
    id,
    is_deleted,
    jikkyo_comment_count,
    jikkyo_date,
    liked,
    prog_end_time,
    prog_start_time,
    screenshot_file_path,
    series_id,
    status,
    subtitle,
    thumbnail_info,
    updated_at,
    views,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
