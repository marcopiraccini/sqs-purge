# sqs-clean
Purge a SQS queue on AWS.
Can be useful for running tests, but keep in mind that purge operations
are allowed every 60 seconds.

To use it simply:

```js

var sqsClean = require('sqs-clean')

sqsClean('myQueue', options, callback)
```

See `.env.sample` for the options to be configured.
