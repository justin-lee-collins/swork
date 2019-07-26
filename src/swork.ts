import { EventType, RequestDelegate } from "./abstractions";
import * as builder from "./builder";
import { FetchContext } from "./fetch-context";

export class Swork {
    private middlewares: Array<(requestDelegate: RequestDelegate) => RequestDelegate> = [];
    private eventHandlers: Map<EventType, Array<() => Promise<void> | void>>;

    constructor() {
        this.eventHandlers = new Map<EventType, Array<() => Promise<void> | void>>();
    }

    public listen(): void {
        if (this.eventHandlers.has("install")) {
            builder.add.install(this.eventHandlers.get("install")!);
        }

        if (this.eventHandlers.has("activate")) {
            builder.add.activate(this.eventHandlers.get("activate")!);
        }

        const delegate = this.build();
        builder.add.fetch(delegate);
    }

    public use(...params: Array<(Swork | ((context: FetchContext, next: RequestDelegate) => Promise<void> | void))>): Swork {
        params.forEach((param) => {
            if (param instanceof Swork) {
                this.middlewares.push.apply(this.middlewares, param.middlewares);
            } else {
                this.middlewares.push((next: RequestDelegate) => {
                    return (context: FetchContext) => {
                        const simpleNext = () => next(context);
                        return param(context, simpleNext);
                    };
                });
            }
        });

        return this;
    }

    public on(event: EventType, ... handlers: Array<() => Promise<void> | void>): void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }

        const eventHandlers = this.eventHandlers.get(event)!;
        eventHandlers.push.apply(eventHandlers, handlers);
    }

    private build(): RequestDelegate {
        let app: RequestDelegate = (context: FetchContext) => {
            context.response = fetch(context.request);
        };

        this.middlewares.reverse().forEach((middleware) => {
            app = middleware(app);
        });

        return app;
    }
}
