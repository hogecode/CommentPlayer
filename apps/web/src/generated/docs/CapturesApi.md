# CapturesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1CapturesGet**](#apiv1capturesget) | **GET** /api/v1/captures | キャプチャ一覧を取得|
|[**apiV1CapturesIdDelete**](#apiv1capturesiddelete) | **DELETE** /api/v1/captures/{id} | キャプチャを削除|
|[**apiV1CapturesIdGet**](#apiv1capturesidget) | **GET** /api/v1/captures/{id} | キャプチャを取得|
|[**apiV1CapturesPost**](#apiv1capturespost) | **POST** /api/v1/captures | キャプチャを作成|

# **apiV1CapturesGet**
> DtoCaptureListResponse apiV1CapturesGet()

キャプチャ一覧をページネーション付きで取得します。sort_key と sort_order でソートをカスタマイズできます

### Example

```typescript
import {
    CapturesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CapturesApi(configuration);

let videoId: number; //ビデオID（フィルタリング用） (optional) (default to undefined)
let page: number; //ページ番号 (optional) (default to 1)
let limit: number; //1ページあたりのアイテム数 (optional) (default to 20)
let sortKey: 'id' | 'created_at'; //ソート対象フィールド (id または created_at) (optional) (default to 'created_at')
let sortOrder: 'asc' | 'desc'; //ソート順序 (asc または desc) (optional) (default to 'desc')

const { status, data } = await apiInstance.apiV1CapturesGet(
    videoId,
    page,
    limit,
    sortKey,
    sortOrder
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoId** | [**number**] | ビデオID（フィルタリング用） | (optional) defaults to undefined|
| **page** | [**number**] | ページ番号 | (optional) defaults to 1|
| **limit** | [**number**] | 1ページあたりのアイテム数 | (optional) defaults to 20|
| **sortKey** | [**&#39;id&#39; | &#39;created_at&#39;**]**Array<&#39;id&#39; &#124; &#39;created_at&#39;>** | ソート対象フィールド (id または created_at) | (optional) defaults to 'created_at'|
| **sortOrder** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | ソート順序 (asc または desc) | (optional) defaults to 'desc'|


### Return type

**DtoCaptureListResponse**

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

# **apiV1CapturesIdDelete**
> DtoSuccessResponse apiV1CapturesIdDelete()

キャプチャをファイルシステムとDBから削除します

### Example

```typescript
import {
    CapturesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CapturesApi(configuration);

let id: number; //キャプチャID (default to undefined)

const { status, data } = await apiInstance.apiV1CapturesIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | キャプチャID | defaults to undefined|


### Return type

**DtoSuccessResponse**

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

# **apiV1CapturesIdGet**
> EntityCapture apiV1CapturesIdGet()

キャプチャをIDで取得します

### Example

```typescript
import {
    CapturesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CapturesApi(configuration);

let id: number; //キャプチャID (default to undefined)

const { status, data } = await apiInstance.apiV1CapturesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | キャプチャID | defaults to undefined|


### Return type

**EntityCapture**

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

# **apiV1CapturesPost**
> EntityCapture apiV1CapturesPost()

新しいキャプチャを作成します

### Example

```typescript
import {
    CapturesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CapturesApi(configuration);

let file: File; //キャプチャファイル (default to undefined)
let videoId: number; //ビデオID (default to undefined)
let playbackPosition: number; //ビデオの再生位置（秒） (optional) (default to undefined)
let commentDelay: number; //コメント遅延秒数 (optional) (default to undefined)

const { status, data } = await apiInstance.apiV1CapturesPost(
    file,
    videoId,
    playbackPosition,
    commentDelay
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] | キャプチャファイル | defaults to undefined|
| **videoId** | [**number**] | ビデオID | defaults to undefined|
| **playbackPosition** | [**number**] | ビデオの再生位置（秒） | (optional) defaults to undefined|
| **commentDelay** | [**number**] | コメント遅延秒数 | (optional) defaults to undefined|


### Return type

**EntityCapture**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

