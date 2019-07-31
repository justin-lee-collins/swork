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

## Use

```ts
use(...params: Array<(Swork | Middleware | Array<(Swork | Middleware)>)>): Swork
```

The `use` method accepts a middleware. Middleware are executed in the order provided for each incoming request. `use` can also accept arrays of middlewares or even provide a different `Swork` app instance.

## On

```ts
on(event: "install" | "activate", ...handlers: Array<(event: ExtendableEvent) => Promise<void> | void>): void
```

Service workers have two life-cycle events associated with their start up: `install` and `activate`. Use the `on` method to provide any callbacks to be executed during that event.

## Listen

```ts
listen(): void
```

To initialize your Swork application, call `listen`. This will add the event handlers and callbacks to your service worker application.
