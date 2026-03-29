# SyobocalApi

All URIs are relative to *https://100.72.160.115*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1SyobocalGet**](#apiv1syobocalget) | **GET** /api/v1/syobocal | Syobocal からタイトル候補を検索|
|[**apiV1SyobocalPost**](#apiv1syobocalpost) | **POST** /api/v1/syobocal | Syobocal タイトル情報を Series に保存|

# **apiV1SyobocalGet**
> DtoSyobocalTitleSearchResponse apiV1SyobocalGet()

指定されたタイトルを Syobocal から検索し、複数候補を返す

### Example

```typescript
import {
    SyobocalApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SyobocalApi(configuration);

let title: string; //検索するタイトル (default to undefined)

const { status, data } = await apiInstance.apiV1SyobocalGet(
    title
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **title** | [**string**] | 検索するタイトル | defaults to undefined|


### Return type

**DtoSyobocalTitleSearchResponse**

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
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SyobocalPost**
> DtoSyobocalSaveTitleResponse apiV1SyobocalPost(request)

選択したタイトル情報を Series テーブルに保存または更新

### Example

```typescript
import {
    SyobocalApi,
    Configuration,
    DtoSyobocalSaveTitleRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SyobocalApi(configuration);

let request: DtoSyobocalSaveTitleRequest; //保存するタイトル情報

const { status, data } = await apiInstance.apiV1SyobocalPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DtoSyobocalSaveTitleRequest**| 保存するタイトル情報 | |


### Return type

**DtoSyobocalSaveTitleResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

