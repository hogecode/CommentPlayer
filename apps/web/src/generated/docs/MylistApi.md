# MylistApi

All URIs are relative to *http://100.72.160.115:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1MylistGet**](#apiv1mylistget) | **GET** /api/v1/mylist | マイリスト一覧を取得|
|[**apiV1MylistPost**](#apiv1mylistpost) | **POST** /api/v1/mylist | マイリストに追加|
|[**apiV1MylistVideoIDCheckGet**](#apiv1mylistvideoidcheckget) | **GET** /api/v1/mylist/:videoID/check | マイリスト登録済みかチェック|
|[**apiV1MylistVideoIDDelete**](#apiv1mylistvideoiddelete) | **DELETE** /api/v1/mylist/:videoID | マイリストから削除|

# **apiV1MylistGet**
> DtoMylistListResponse apiV1MylistGet()

ユーザーのマイリスト一覧を取得します

### Example

```typescript
import {
    MylistApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MylistApi(configuration);

let page: number; //ページ番号 (optional) (default to 1)
let limit: number; //1ページあたりのアイテム数 (optional) (default to 20)

const { status, data } = await apiInstance.apiV1MylistGet(
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | ページ番号 | (optional) defaults to 1|
| **limit** | [**number**] | 1ページあたりのアイテム数 | (optional) defaults to 20|


### Return type

**DtoMylistListResponse**

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

# **apiV1MylistPost**
> DtoMylistResponse apiV1MylistPost(body)

動画をマイリストに追加します

### Example

```typescript
import {
    MylistApi,
    Configuration,
    DtoMylistRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MylistApi(configuration);

let body: DtoMylistRequest; //リクエストボディ

const { status, data } = await apiInstance.apiV1MylistPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoMylistRequest**| リクエストボディ | |


### Return type

**DtoMylistResponse**

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

# **apiV1MylistVideoIDCheckGet**
> { [key: string]: boolean; } apiV1MylistVideoIDCheckGet()

動画がマイリストに入っているかチェックします

### Example

```typescript
import {
    MylistApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MylistApi(configuration);

let videoID: number; //ビデオID (default to undefined)

const { status, data } = await apiInstance.apiV1MylistVideoIDCheckGet(
    videoID
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoID** | [**number**] | ビデオID | defaults to undefined|


### Return type

**{ [key: string]: boolean; }**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1MylistVideoIDDelete**
> DtoSuccessResponse apiV1MylistVideoIDDelete()

動画をマイリストから削除します

### Example

```typescript
import {
    MylistApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MylistApi(configuration);

let videoID: number; //ビデオID (default to undefined)

const { status, data } = await apiInstance.apiV1MylistVideoIDDelete(
    videoID
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoID** | [**number**] | ビデオID | defaults to undefined|


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

