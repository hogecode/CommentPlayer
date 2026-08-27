# DtoAdminStatsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**daily_views** | [**Array&lt;DtoDailyViewsResponse&gt;**](DtoDailyViewsResponse.md) |  | [optional] [default to undefined]
**month** | **number** |  | [optional] [default to undefined]
**monthly_summary** | [**DtoMonthlyStatsResponse**](DtoMonthlyStatsResponse.md) |  | [optional] [default to undefined]
**series_views** | [**Array&lt;DtoSeriesViewsResponse&gt;**](DtoSeriesViewsResponse.md) |  | [optional] [default to undefined]
**video_ranking** | [**Array&lt;DtoVideoRankingResponse&gt;**](DtoVideoRankingResponse.md) |  | [optional] [default to undefined]
**watched_history_by_date** | [**Array&lt;DtoWatchedHistoryByDateResponse&gt;**](DtoWatchedHistoryByDateResponse.md) |  | [optional] [default to undefined]
**year** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { DtoAdminStatsResponse } from './api';

const instance: DtoAdminStatsResponse = {
    daily_views,
    month,
    monthly_summary,
    series_views,
    video_ranking,
    watched_history_by_date,
    year,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
