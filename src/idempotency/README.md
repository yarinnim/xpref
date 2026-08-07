# Idempotency

Idempotency is to make sure the unique request on POST method is operated once only.
The client need to retry when it fails. The Idempotency request need to ship with
header key named `idempotency-key`, a unique key using **uuid v4** format.
The retry should be performed on the following HTTP Status codes:

- 5xx: Server Error
- 422: Validation error
- 429: Rate Limit
- More status codes, base on real situation.

The retries should have and exponential backoff and/or jitter. Means the number of retries
should be limited and each retry interval should be defined differently.

The idempotency is location at `xpref/idempotency` module, with the following properties:

- `ttl`: Time To Live in seconds
- `enforced`: Boolean of if this route is forced to use Idempotency mechanism or not
- `headerKey`: String of key in the header to identify the idempotency key.
- `validateReponse`: A callback function to validate the response. The callback function
  needs to return `boolean` value to determine if the request is successfully operated
  or failed in some reasons. The callback function accepts on parameter represents the
  response information as well as decoded body. In some case, the encoded body is just
  and empty object, which was failed in decoding, so you can use `chunks` information
  to encode manually, as it's the original streamed body.

## Example

The following example will force the request to be in idempotency request of
`/wallets/transfer` path.

```ts
import { Route } from 'xpref';
import idempotency from 'xpref/idempotency';

export default {
  '/wallets': ['wallets', [], {}, {
    '/transfer': ['transfer', [idempotency({ enforced: true })], {
        post: walletTransferAction
    }],
  }],
} as Route;
```

> [!NOTE]
> At the curren implementation, the Idempotency supports only `json` and
> `x-www-form-urlencoded` format. So, for `form-data` request, you need
> handle by your way. Anyway, the `POST` method is applied,

The following example if the content of the body has member `errorCode`
is not equal 0, then it treats the operation is failed.

```ts
idempotency({
  encforced: true,
  validateResponse: (response: Record<String, any>) => {
    const { errorCode = 0 } = response;
    return errorCode === 0;
  },
});
```
