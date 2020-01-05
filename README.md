# puppeteer-pending-requests
## Introduction
Provides utility to wait for network to be idle for passed time.

This utility basically checks for zero pending requests and there is no new request for passed time.

## Install
```
npm install @agabhane/puppeteer-pending-requests
```

## Usage
Import `@agabhane/puppeteer-pending-requests` in your code
```
const { PuppeteerPendingRequests } = require('@agabhane/puppeteer-pending-requests');
```

Create an instance by passing Puppeteer page
```
let puppeteerPendingRequests = new PuppeteerPendingRequests(page);
```

Use `waitForNetworkIdle()` function to wait for network to be idle for passed time.
```
await waitForNetworkIdle(500);
```

`waitForNetworkIdle(500)` function returns promise which gets resolved when network was idle for passed time (in this example 500 ms)

To avoid race condition, please use below syntax.

```
await Promise.all([       
    puppeteerPendingRequests.waitForNetworkIdle(500),
    await this.someElement.click()
]);
```

## Example
### Example 1
Lets say there are two xhr requests happen when we click on a button, 1st request happens as soon as we click on button and 2nd request happens after 200 milliseconds after receiving 1st requests response.

```
1req------|
           ----200ms----|
                        2req--------|
                                     ----250ms (network idle)-----
                                

```

We want our function to wait for both requests to finish.

We will call our function with time more than 200 (lets say 250) so that we will wait for both requests to finish

```
await Promise.all([       
    puppeteerPendingRequests.waitForNetworkIdle(250),
    await this.button.click()
]);
```

### Example 2
Lets say there are three xhr requests happen simultaneously when we click on a button.

```
1req------|
2req---------------|
3req---|
                    ------100 ms (network idle) -----
```

We want our function to wait for all requests to finish.

We will call our function with time more than 0 (lets say 100 default). Since we all requests happening at the same time, time does not matter. Function will wait untill all requests finish.

```
await Promise.all([       
    puppeteerPendingRequests.waitForNetworkIdle(100),
    await this.button.click()
]);
```

## Documentation

### `PuppeteerPendingRequests`
Constructor function takes puppeterr page as paramter and returns instance

**Params**
| Name | Type | Default |  Description |
| --- | --- | --- | --- |
| page | Puppeteer Page Object |  | |

**Returns**

PuppeteerPendingRequests instance

### `waitForNetworkIdle`
Wait for network to be idle for said time

**Params**
| Name | Type | Default |  Description |
| --- | --- | --- | --- |
| time | `number` | 100 | This will make function to wait for network to be idle for 100ms |
| resourceType | `string` | `'xhr'` | Resource type to wait for

**Returns**

Promise which will get resolved when there is network idle for passed time for specific resource type