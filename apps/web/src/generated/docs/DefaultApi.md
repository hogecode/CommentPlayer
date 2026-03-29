# DefaultApi

All URIs are relative to *https://100.72.160.115*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1SeriesIdGet**](#apiv1seriesidget) | **GET** /api/v1/series/:id | |
|[**apiV1SeriesPost**](#apiv1seriespost) | **POST** /api/v1/series | |
|[**apiV1SeriesResyncPost**](#apiv1seriesresyncpost) | **POST** /api/v1/series/resync | |

# **apiV1SeriesIdGet**
> DtoSeriesWithVideosResponse apiV1SeriesIdGet()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: number; //Series ID (default to undefined)

const { status, data } = await apiInstance.apiV1SeriesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Series ID | defaults to undefined|


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
|**404** | Series not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SeriesPost**
> DtoSeriesListResponse apiV1SeriesPost()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.apiV1SeriesPost();
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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SeriesResyncPost**
> { [key: string]: object; } apiV1SeriesResyncPost()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

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
|**200** | Sync successful |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

