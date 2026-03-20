# Video


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | ビデオID | [default to undefined]
**file_name** | **string** | ファイル名 | [default to undefined]
**status** | **string** | ビデオステータス | [optional] [default to undefined]
**file_size** | **number** | ファイルサイズ（バイト） | [default to undefined]
**jikkyo_comment_count** | **number** | 実況コメント数 | [optional] [default to undefined]
**jikkyo_date** | **string** | 実況日時 | [optional] [default to undefined]
**views** | **number** | 閲覧数 | [default to undefined]
**liked** | **boolean** | お気に入りフラグ | [default to undefined]
**duration** | **number** | 動画長（秒） | [default to undefined]
**created_at** | **string** | 作成日時 | [default to undefined]
**updated_at** | **string** | 更新日時 | [default to undefined]
**thumbnail_info** | [**ThumbnailInfo**](ThumbnailInfo.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Video } from './api';

const instance: Video = {
    id,
    file_name,
    status,
    file_size,
    jikkyo_comment_count,
    jikkyo_date,
    views,
    liked,
    duration,
    created_at,
    updated_at,
    thumbnail_info,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
