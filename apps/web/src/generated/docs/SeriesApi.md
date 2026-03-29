# SeriesApi

All URIs are relative to *https://100.72.160.115*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1SeriesGet**](#apiv1seriesget) | **GET** /api/v1/series | シリーズ一覧を取得|
|[**apiV1SeriesIdGet**](#apiv1seriesidget) | **GET** /api/v1/series/{id} | シリーズとそのビデオを取得|
|[**apiV1SeriesResyncPost**](#apiv1seriesresyncpost) | **POST** /api/v1/series/resync | すべてのビデオをシリーズと同期|

# **apiV1SeriesGet**
> DtoSeriesListResponse apiV1SeriesGet()

全てのシリーズの一覧を取得します

### Example

```typescript
import {
    SeriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.apiV1SeriesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DtoSeriesListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SeriesIdGet**
> DtoSeriesWithVideosResponse apiV1SeriesIdGet()

指定されたシリーズIDに関連する全てのビデオを取得します

### Example

```typescript
import {
    SeriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

let id: number; //シリーズID (default to undefined)

const { status, data } = await apiInstance.apiV1SeriesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | シリーズID | defaults to undefined|


### Return type

**DtoSeriesWithVideosResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SeriesResyncPost**
> { [key: string]: object; } apiV1SeriesResyncPost()

全てのビデオをシリーズと再同期します。ファイル名パターンからシリーズを抽出し、ビデオに割り当てます。

### Example

```typescript
import {
    SeriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SeriesApi(configuration);

const { status, data } = await apiInstance.apiV1SeriesResyncPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

