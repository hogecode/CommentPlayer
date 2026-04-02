# UsersApi

All URIs are relative to *http://localhost:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1UsersPost**](#apiv1userspost) | **POST** /api/v1/users | ユーザーアカウント作成|
|[**apiV1UsersTokenPost**](#apiv1userstokenpost) | **POST** /api/v1/users/token | アクセストークン発行 API (OAuth2 準拠)|

# **apiV1UsersPost**
> EntityUser apiV1UsersPost(body)

新しいユーザーアカウントを作成します

### Example

```typescript
import {
    UsersApi,
    Configuration,
    DtoUserCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let body: DtoUserCreateRequest; //ユーザー作成リクエスト

const { status, data } = await apiInstance.apiV1UsersPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoUserCreateRequest**| ユーザー作成リクエスト | |


### Return type

**EntityUser**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**422** | Unprocessable Entity |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiV1UsersTokenPost**
> DtoUserAccessToken apiV1UsersTokenPost(body)

ユーザーの認証情報を検証し、JWT トークンを発行します

### Example

```typescript
import {
    UsersApi,
    Configuration,
    DtoUserAccessTokenRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let body: DtoUserAccessTokenRequest; //ユーザー名とパスワード

const { status, data } = await apiInstance.apiV1UsersTokenPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **DtoUserAccessTokenRequest**| ユーザー名とパスワード | |


### Return type

**DtoUserAccessToken**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

