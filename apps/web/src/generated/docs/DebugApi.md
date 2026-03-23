# DebugApi

All URIs are relative to *http://localhost:8000/api/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getDocs**](#getdocs) | **GET** /swagger.json | 埋め込み Swagger ドキュメントを提供（デバッグビルドのみ）|

# **getDocs**
> { [key: string]: object; } getDocs()


### Example

```typescript
import {
    DebugApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DebugApi(configuration);

const { status, data } = await apiInstance.getDocs();
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
|**200** | Swagger JSON |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

