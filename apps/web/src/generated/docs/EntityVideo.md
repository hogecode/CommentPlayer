# EntityVideo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**created_at** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**duration** | **number** |  | [optional] [default to undefined]
**file_name** | **string** |  | [optional] [default to undefined]
**file_size** | **number** |  | [optional] [default to undefined]
**folder_id** | **number** | Folderテーブルへの外部キー | [optional] [default to undefined]
**id** | **number** |  | [optional] [default to undefined]
**is_deleted** | **boolean** |  | [optional] [default to undefined]
**jikkyo_comment_count** | **number** |  | [optional] [default to undefined]
**jikkyo_date** | **string** |  | [optional] [default to undefined]
**liked** | **boolean** |  | [optional] [default to undefined]
**screenshot_file_path** | **string** |  | [optional] [default to undefined]
**status** | **string** | ready, processing, error | [optional] [default to undefined]
**thumbnail_info** | [**EntityThumbnailInfo**](EntityThumbnailInfo.md) |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**views** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { EntityVideo } from './api';

const instance: EntityVideo = {
    created_at,
    description,
    duration,
    file_name,
    file_size,
    folder_id,
    id,
    is_deleted,
    jikkyo_comment_count,
    jikkyo_date,
    liked,
    screenshot_file_path,
    status,
    thumbnail_info,
    updated_at,
    views,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
