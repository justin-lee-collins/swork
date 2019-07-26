# Swork

Swork is a service worker building framework intended to be a robust foundation for service worker applications. TypeScript and async functions are central to its implementation enabling increased productivity, reduced error rate and the removal of callbacks. Swork is not bundled with any middleware.

### Hello World

```ts
// sw.ts

import { Swork, FetchContext, RequestDelegate } from "swork";

const app = new Swork();

app.use((context: FetchContext, next: RequestDelegate) => {
    context.respondWith(new Response("Hello World!"));
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

More to come!
