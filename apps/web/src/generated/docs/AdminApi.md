# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1AdminStatsMonthlyGet**](#apiv1adminstatsmonthlyget) | **GET** /api/v1/admin/stats/monthly | 月別統計を取得|

# **apiV1AdminStatsMonthlyGet**
> DtoAdminStatsResponse apiV1AdminStatsMonthlyGet()

指定年月の統計情報（日付ごと再生数、シリーズ別再生数、動画ランキング等）を取得

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let year: number; //年（デフォルト: 当年） (optional) (default to undefined)
let month: number; //月（デフォルト: 当月, 1-12） (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1AdminStatsMonthlyGet(
    year,
    month
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **year** | [**number**] | 年（デフォルト: 当年） | (optional) defaults to undefined|
| **month** | [**number**] | 月（デフォルト: 当月, 1-12） | (optional) defaults to undefined|


### Return type

**DtoAdminStatsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

