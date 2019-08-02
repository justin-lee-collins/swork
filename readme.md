# swork

Swork is a service worker building framework intended to be a robust foundation for service worker applications. TypeScript and async functions are central to its implementation enabling increased productivity, reduced error rate and the removal of callbacks. Swork is not bundled with any middleware.

### Hello World

```ts
// sw.ts

import { Swork, FetchContext, RequestDelegate } from "swork";

const app = new Swork();

app.use((context: FetchContext, next: RequestDelegate) => {
    context.response = new Response("Hello World!");
});

app.listen();
```

## Installation

Install via npm:

```ts
npm install swork
```

Install via yarn:

```ts
yarn add swork
```

## Middleware

Swork is a middleware framework that accepts both async and standard functions. Middleware take two parameters: `context` and `next`. The supplied `context` is created anew for each request and encapsulates the initiating fetch event, request and eventual response. `next` is a function that when invoked will execute the downstream middleware.

### Async Function

```ts
app.use(async (context: FetchContext, next: () => Promise<void>) => {
    const start = performance.now();
    await next();
    const timeElapsed = (performance.now() - start).toFixed(2);
    console.log(`${context.request.method} ${context.request.url} - ${timeElapsed} ms`);
});
```

### Standard Function

```ts
app.use((context: FetchContext, next: () => Promise<void>) => {
    const start = performance.now();
    next().then(() => {
        const timeElapsed = (performance.now() - start).toFixed(2);
        console.log(`${context.request.method} ${context.request.url} - ${timeElapsed} ms`);
    });
});
```

## Implementations

| Middleware | Description | Package | Repository |
|------------|-------------|---------|------------|
| swork-router| Router middleware | [npmjs](https://www.npmjs.com/package/swork-router) | [github](https://github.com/justin-lee-collins/swork-router) |

## Use

```ts
use(...params: Array<(Swork | Middleware | Array<(Swork | Middleware)>)>): Swork
```

The `use` method accepts a middleware. Middleware are executed in the order provided for each incoming request via a `fetch` event handler. `use` can also accept arrays of middlewares or even provide a different `Swork` app instance.

## On

```ts
on(event: EventType, ...handlers: Array<(event: any) => Promise<void> | void>): void
```

Use the `on` method to provide any handlers to be executed during service worker events. The event type will vary based upon the event fired.

### Swork supported events

* `activate`
* `install`
* `message`
* `notificationclick`
* `notificationclose`
* `push`
* `pushsubscriptionchange`
* `sync`

## Listen

```ts
listen(): void
```

To initialize your Swork application, call `listen`. This will add the event handlers and callbacks to your service worker application.

## Configuration

There are a handful of properties which will apply globally to the Swork application. Those include:

* `version`  
    The version of the service worker. Defaults to `"1.0.0"`.
* `origin`  
    The origin of the service worker. Defaults to `self.location.origin`.
* `environment`  
    The running environment. Defaults to `production`.

These configurations can be accessed or modified by referencing the `swork/configuration` module.

```ts
import { configuration } from "swork/configuration";

console.log(configuration);
// => { version: "1.0.0", origin: "https://localhost", environment: "production" }
```
