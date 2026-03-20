# CapturesApi

All URIs are relative to *http://localhost:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1CapturesGet**](#apiv1capturesget) | **GET** /api/v1/captures | キャプチャ一覧を取得|
|[**apiV1CapturesPost**](#apiv1capturespost) | **POST** /api/v1/captures | キャプチャを作成|

# **apiV1CapturesGet**
> CaptureListResponse apiV1CapturesGet()

キャプチャ一覧をページネーション付きで取得します

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

const { status, data } = await apiInstance.apiV1CapturesGet(
    videoId,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoId** | [**number**] | ビデオID（フィルタリング用） | (optional) defaults to undefined|
| **page** | [**number**] | ページ番号 | (optional) defaults to 1|
| **limit** | [**number**] | 1ページあたりのアイテム数 | (optional) defaults to 20|


### Return type

**CaptureListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 成功 |  -  |
|**500** | サーバーエラー |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1CapturesPost**
> Capture apiV1CapturesPost()

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

const { status, data } = await apiInstance.apiV1CapturesPost(
    file,
    videoId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] | キャプチャファイル | defaults to undefined|
| **videoId** | [**number**] | ビデオID | defaults to undefined|


### Return type

**Capture**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 作成成功 |  -  |
|**400** | リクエストエラー |  -  |
|**404** | ビデオが見つかりません |  -  |
|**500** | サーバーエラー |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

