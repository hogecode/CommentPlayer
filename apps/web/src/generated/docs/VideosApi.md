# VideosApi

All URIs are relative to *http://localhost:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1VideosGet**](#apiv1videosget) | **GET** /api/v1/videos | ビデオ一覧を取得|
|[**apiV1VideosIdDownloadGet**](#apiv1videosiddownloadget) | **GET** /api/v1/videos/{id}/download | ビデオをダウンロード|
|[**apiV1VideosIdGet**](#apiv1videosidget) | **GET** /api/v1/videos/{id} | ビデオ詳細を取得|
|[**apiV1VideosIdThumbnailRegeneratePost**](#apiv1videosidthumbnailregeneratepost) | **POST** /api/v1/videos/{id}/thumbnail/regenerate | サムネイルを再生成|
|[**apiV1VideosSearchGet**](#apiv1videossearchget) | **GET** /api/v1/videos/search | ビデオを検索|

# **apiV1VideosGet**
> DtoVideoListResponse apiV1VideosGet()

ページネーション対応のビデオ一覧を取得します

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let ids: Array<number>; //ビデオID（複数指定可能） (optional) (default to undefined)
let filterBy: string; //フィルター (optional) (default to undefined)
let page: number; //ページ番号 (optional) (default to 1)
let limit: number; //1ページあたりのアイテム数 (optional) (default to 20)
let sort: string; //ソート対象フィールド (optional) (default to 'created_at')
let order: string; //ソート順序 (optional) (default to 'desc')

const { status, data } = await apiInstance.apiV1VideosGet(
    ids,
    filterBy,
    page,
    limit,
    sort,
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ids** | **Array&lt;number&gt;** | ビデオID（複数指定可能） | (optional) defaults to undefined|
| **filterBy** | [**string**] | フィルター | (optional) defaults to undefined|
| **page** | [**number**] | ページ番号 | (optional) defaults to 1|
| **limit** | [**number**] | 1ページあたりのアイテム数 | (optional) defaults to 20|
| **sort** | [**string**] | ソート対象フィールド | (optional) defaults to 'created_at'|
| **order** | [**string**] | ソート順序 | (optional) defaults to 'desc'|


### Return type

**DtoVideoListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**422** | Unprocessable Entity |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1VideosIdDownloadGet**
> File apiV1VideosIdDownloadGet()

ビデオファイルをダウンロードします

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let id: number; //ビデオID (default to undefined)

const { status, data } = await apiInstance.apiV1VideosIdDownloadGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ビデオID | defaults to undefined|


### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/octet-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1VideosIdGet**
> EntityVideo apiV1VideosIdGet()

特定のビデオの詳細情報を取得します

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let id: number; //ビデオID (default to undefined)

const { status, data } = await apiInstance.apiV1VideosIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | ビデオID | defaults to undefined|


### Return type

**EntityVideo**

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

# **apiV1VideosIdThumbnailRegeneratePost**
> DtoThumbnailRegenerateResponse apiV1VideosIdThumbnailRegeneratePost()

ビデオのサムネイルを再生成します

### Example

```typescript
import {
    VideosApi,
    Configuration,
    DtoThumbnailRegenerateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let id: number; //ビデオID (default to undefined)
let body: DtoThumbnailRegenerateRequest; //リクエストボディ (optional)

const { status, data } = await apiInstance.apiV1VideosIdThumbnailRegeneratePost(
    id,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoThumbnailRegenerateRequest**| リクエストボディ | |
| **id** | [**number**] | ビデオID | defaults to undefined|


### Return type

**DtoThumbnailRegenerateResponse**

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

# **apiV1VideosSearchGet**
> DtoVideoListResponse apiV1VideosSearchGet()

キーワードでビデオを検索します

### Example

```typescript
import {
    VideosApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VideosApi(configuration);

let q: string; //検索キーワード (default to undefined)
let page: number; //ページ番号 (optional) (default to 1)
let limit: number; //1ページあたりのアイテム数 (optional) (default to 20)
let order: string; //ソート順序 (optional) (default to 'desc')
let filterBy: string; //フィルター (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1VideosSearchGet(
    q,
    page,
    limit,
    order,
    filterBy
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | 検索キーワード | defaults to undefined|
| **page** | [**number**] | ページ番号 | (optional) defaults to 1|
| **limit** | [**number**] | 1ページあたりのアイテム数 | (optional) defaults to 20|
| **order** | [**string**] | ソート順序 | (optional) defaults to 'desc'|
| **filterBy** | [**string**] | フィルター | (optional) defaults to undefined|


### Return type

**DtoVideoListResponse**

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

