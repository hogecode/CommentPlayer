# FoldersApi

All URIs are relative to *http://localhost:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1FoldersGet**](#apiv1foldersget) | **GET** /api/v1/folders | 監視対象フォルダ一覧を取得|
|[**apiV1FoldersIdDelete**](#apiv1foldersiddelete) | **DELETE** /api/v1/folders/{id} | 監視対象フォルダを削除|
|[**apiV1FoldersPost**](#apiv1folderspost) | **POST** /api/v1/folders | 監視対象フォルダを追加|

# **apiV1FoldersGet**
> DtoFolderListResponse apiV1FoldersGet()

監視対象フォルダの一覧を取得します

### Example

```typescript
import {
    FoldersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FoldersApi(configuration);

const { status, data } = await apiInstance.apiV1FoldersGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DtoFolderListResponse**

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

# **apiV1FoldersIdDelete**
> DtoFolderActionResponse apiV1FoldersIdDelete()

フォルダを監視対象から削除します（ソフトデリート）

### Example

```typescript
import {
    FoldersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FoldersApi(configuration);

let id: number; //フォルダID (default to undefined)

const { status, data } = await apiInstance.apiV1FoldersIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | フォルダID | defaults to undefined|


### Return type

**DtoFolderActionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1FoldersPost**
> DtoFolderActionResponse apiV1FoldersPost(body)

新しいフォルダを監視対象に追加します

### Example

```typescript
import {
    FoldersApi,
    Configuration,
    DtoFolderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new FoldersApi(configuration);

let body: DtoFolderRequest; //フォルダパス

const { status, data } = await apiInstance.apiV1FoldersPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoFolderRequest**| フォルダパス | |


### Return type

**DtoFolderActionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

