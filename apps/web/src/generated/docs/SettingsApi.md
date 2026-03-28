# SettingsApi

All URIs are relative to *https://100.72.160.115*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1SettingsClientGet**](#apiv1settingsclientget) | **GET** /api/v1/settings/client | クライアント設定取得 API|
|[**apiV1SettingsClientPut**](#apiv1settingsclientput) | **PUT** /api/v1/settings/client | クライアント設定更新 API|

# **apiV1SettingsClientGet**
> DtoClientSettingsDTO apiV1SettingsClientGet()

ログイン中のユーザーアカウントのクライアント設定を取得する

### Example

```typescript
import {
    SettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

const { status, data } = await apiInstance.apiV1SettingsClientGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DtoClientSettingsDTO**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1SettingsClientPut**
> apiV1SettingsClientPut(body)

ログイン中のユーザーアカウントのクライアント設定を更新する

### Example

```typescript
import {
    SettingsApi,
    Configuration,
    DtoUpdateClientSettingsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SettingsApi(configuration);

let body: DtoUpdateClientSettingsRequest; //更新するクライアント設定のデータ

const { status, data } = await apiInstance.apiV1SettingsClientPut(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoUpdateClientSettingsRequest**| 更新するクライアント設定のデータ | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**422** | Unprocessable Entity |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

