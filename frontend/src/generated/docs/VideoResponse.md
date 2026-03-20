# VideoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**is_success** | **boolean** | リクエスト成功フラグ | [default to undefined]
**src** | **string** | ビデオソース（URL） | [default to undefined]
**title** | **string** | ビデオタイトル | [optional] [default to undefined]
**description** | **string** | ビデオ説明 | [optional] [default to undefined]
**comments** | [**Array&lt;ApiComment&gt;**](ApiComment.md) | 弾幕コメント一覧 | [default to undefined]

## Example

```typescript
import { VideoResponse } from './api';

const instance: VideoResponse = {
    is_success,
    src,
    title,
    description,
    comments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
