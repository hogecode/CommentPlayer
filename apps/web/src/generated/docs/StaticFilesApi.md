# StaticFilesApi

All URIs are relative to *http://localhost:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiV1FilesFolderIDFilepathGet**](#apiv1filesfolderidfilepathget) | **GET** /api/v1/files/{folderID}/{filepath} | フォルダ内のファイルを取得|

# **apiV1FilesFolderIDFilepathGet**
> File apiV1FilesFolderIDFilepathGet()

指定されたフォルダ内のファイルを取得します

### Example

```typescript
import {
    StaticFilesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StaticFilesApi(configuration);

let folderID: number; //フォルダID (default to undefined)
let filepath: string; //ファイルパス (default to undefined)

const { status, data } = await apiInstance.apiV1FilesFolderIDFilepathGet(
    folderID,
    filepath
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **folderID** | [**number**] | フォルダID | defaults to undefined|
| **filepath** | [**string**] | ファイルパス | defaults to undefined|


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

