# DtoDailyViewsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**date** | **string** | YYYY-MM-DD format | [optional] [default to undefined]
**videos** | [**Array&lt;DtoDailyVideoViewResponse&gt;**](DtoDailyVideoViewResponse.md) | その日に視聴された動画の詳細 | [optional] [default to undefined]
**view_count** | **number** | その日の総再生数 | [optional] [default to undefined]

## Example

```typescript
import { DtoDailyViewsResponse } from './api';

const instance: DtoDailyViewsResponse = {
    date,
    videos,
    view_count,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
