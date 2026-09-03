# DtoSeriesEpisodeResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**episode** | **number** | エピソード番号 | [optional] [default to undefined]
**file_name** | **string** | ファイル名 | [optional] [default to undefined]
**subtitle** | **string** | エピソードのサブタイトル | [optional] [default to undefined]
**video_id** | **number** | ビデオID | [optional] [default to undefined]
**views** | **number** | 動画の総再生数 | [optional] [default to undefined]
**watch_history** | [**Array&lt;DtoSeriesEpisodeWatchHistoryItem&gt;**](DtoSeriesEpisodeWatchHistoryItem.md) | 視聴履歴 | [optional] [default to undefined]

## Example

```typescript
import { DtoSeriesEpisodeResponse } from './api';

const instance: DtoSeriesEpisodeResponse = {
    episode,
    file_name,
    subtitle,
    video_id,
    views,
    watch_history,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
