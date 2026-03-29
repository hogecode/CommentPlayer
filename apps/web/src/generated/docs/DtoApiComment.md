# DtoApiComment


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**author** | **string** | コメント投稿者ID（匿名の場合はnil） | [optional] [default to undefined]
**color** | **string** | コメント色（16進数カラーコード） | [default to undefined]
**size** | **string** | コメントサイズ | [default to undefined]
**text** | **string** | コメント本文 | [default to undefined]
**time** | **number** | コメント表示時刻（秒） | [default to undefined]
**type** | **string** | コメント位置 | [default to undefined]

## Example

```typescript
import { DtoApiComment } from './api';

const instance: DtoApiComment = {
    author,
    color,
    size,
    text,
    time,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
