import { EventType, RequestDelegate } from "./abstractions";
import * as builder from "./builder";
import { FetchContext } from "./fetch-context";

export class Swork {
    private middlewares: Array<(requestDelegate: RequestDelegate) => RequestDelegate> = [];
    private eventHandlers: Map<EventType, Array<() => Promise<void> | void>>;

    constructor() {
        this.eventHandlers = new Map<EventType, Array<() => Promise<void> | void>>();
        this.eventHandlers.set("install", []);
        this.eventHandlers.set("activate", []);
    }

    public listen(): void {
        if (this.eventHandlers.get("install")!.length) {
            builder.add.install(this.eventHandlers.get("install")!);
        }

        if (this.eventHandlers.get("activate")!.length) {
            builder.add.activate(this.eventHandlers.get("activate")!);
        }

        const delegate = this.build();
        builder.add.fetch(delegate);
    }

    public use(...params: Array<(Swork | ((context: FetchContext, next: RequestDelegate) => Promise<void> | void))>): Swork {
        params.forEach((param) => {
            if (param instanceof Swork) {
                Array.prototype.push.apply(this.eventHandlers.get("install"), param.eventHandlers.get("install")!);                
                Array.prototype.push.apply(this.eventHandlers.get("activate"), param.eventHandlers.get("activate")!);
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
        Array.prototype.push.apply(this.eventHandlers.get(event)!, handlers);
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
