# swork
[![npm](https://img.shields.io/npm/v/swork)](https://www.npmjs.com/package/swork) [![travis ci](https://travis-ci.org/justin-lee-collins/swork.svg?branch=master)](https://travis-ci.org/justin-lee-collins/swork.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/justin-lee-collins/swork/badge.svg?branch=master)](https://coveralls.io/github/justin-lee-collins/swork?branch=master) [![download](https://img.shields.io/npm/dw/swork)](https://img.shields.io/npm/dw/swork) [![Greenkeeper badge](https://badges.greenkeeper.io/justin-lee-collins/swork.svg)](https://greenkeeper.io/) [![Join the chat at https://gitter.im/swork-chat/community](https://badges.gitter.im/swork-chat/community.svg)](https://gitter.im/swork-chat/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

swork is a service worker building framework intended to be a robust foundation for service worker applications. TypeScript and async functions are central to its implementation enabling increased productivity, reduced error rate and the removal of callbacks. Swork is not bundled with any middleware.

**License**

MIT

**Installation**

`npm install swork`

`yarn add swork`

**Example**

```ts
import { Swork, FetchContext } from "swork";

const app = new Swork();

app.use((context: FetchContext, next: () => Promise<void>)) => {
    context.response = new Response("Hello World!");
});

app.listen();
```

## Middleware

Swork is a middleware framework that accepts both async and standard functions. Middleware take two parameters: `context` and `next`. The supplied `context` is created anew for each request and encapsulates the initiating fetch event, request and eventual response. `next` is a function that when invoked will execute the downstream middleware.

**Async Function**

```ts
app.use(async (context: FetchContext, next: () => Promise<void>) => {
    const start = performance.now();
    await next();
    const timeElapsed = (performance.now() - start).toFixed(2);
    console.log(`${context.request.method} ${context.request.url} - ${timeElapsed} ms`);
});
```

**Standard Function**

```ts
app.use((context: FetchContext, next: () => Promise<void>) => {
    const start = performance.now();
    next().then(() => {
        const timeElapsed = (performance.now() - start).toFixed(2);
        console.log(`${context.request.method} ${context.request.url} - ${timeElapsed} ms`);
    });
});
```

### Middleware Implementations

| Middleware | Description | Package | Repository |
|------------|-------------|---------|------------|
| swork-router| Router middleware | [npmjs](https://www.npmjs.com/package/swork-router) | [github](https://github.com/justin-lee-collins/swork-router) |
| swork-cache| Cache strategies and events | [npmjs](https://www.npmjs.com/package/swork-cache) | [github](https://github.com/justin-lee-collins/swork-cache) |
| swork-link| Link separate middleware pipelines | [npmjs](https://www.npmjs.com/package/swork-link) | [github](https://github.com/justin-lee-collins/swork-link) |
| swork-claim-clients | Claim active clients | [npmjs](https://www.npmjs.com/package/swork-claim-clients) | [github](https://github.com/justin-lee-collins/swork-claim-clients) |
| swork-logger | Logs all fetch requests | [npmjs](https://www.npmjs.com/package/swork-logger) | [github](https://github.com/justin-lee-collins/swork-logger) |  
| swork-if | Middleware branching strategies | [npmjs](https://www.npmjs.com/package/swork-if) | [github](https://github.com/justin-lee-collins/swork-if) |


## Methods

**use**

```ts
use(...params: Array<(Swork | Middleware | Array<(Swork | Middleware)>)>): Swork
```

The `use` method accepts a middleware. Middleware are executed in the order provided for each incoming request via a `fetch` event handler. `use` can also accept arrays of middlewares or even provide a different `Swork` app instance.

**on**

```ts
on(event: EventType, ...handlers: Array<(event: any) => Promise<void> | void>): void
```

Use the `on` method to provide any handlers to be executed during service worker events. The event type will vary based upon the event fired. On supports the following events: `activate`, `install`, `message`, `notificationclick`, `notificationclose`, `push`, `pushsubscriptionchange`, `sync`

**listen**

```ts
listen(): void
```

To initialize your Swork application, call `listen`. This will add the event handlers and callbacks to your service worker application.

## Configuration

These properties apply globally to the Swork application.

**version**  
The version of the service worker. Defaults to `"1.0.0"`.

**origin**  
The origin of the service worker. Defaults to `self.location.origin`.

**environment**  
The running environment. Defaults to `"production"`.

These configurations can be referenced through the `swork` module.

```ts
import { configuration } from "swork";

configuration.environment = "production";
console.log(configuration);
// => { version: "1.0.0", origin: "https://localhost", environment: "production" }
```

## Notes

As service workers do not yet natively support ES6 modules, a Swork implementation is expected to be built with your preferred bundler (e.g. Webpack, Rollup)

## Contact

If you are using `swork` or any of its related middlewares, please let me know on [gitter](https://gitter.im/swork-chat/community). I am always looking for feedback or additional middleware ideas.
