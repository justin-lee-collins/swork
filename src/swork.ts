import * as builder from "./builder";
import { FetchContext } from "./fetch-context";

export type EventType = "activate" | "install";
export type EventHandler = () => Promise<void> | void;
export type RequestDelegate = (context: FetchContext) => Promise<void>;
export type Middleware = (context: FetchContext, next: () => Promise<void>) => Promise<void> | void;

export class Swork {
    protected middlewares: Middleware[] = [];
    protected eventHandlers: Map<EventType, Array<() => Promise<void> | void>>;

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

    public use(...params: Array<(Swork | Middleware | Array<(Swork | Middleware)>)>): Swork {
        params.forEach((param) => {
            if (!Array.isArray(param)) {
                param = [param];
            }

            param.forEach((p) => {
                if (p instanceof Swork) {
                    Array.prototype.push.apply(this.eventHandlers.get("install"), p.eventHandlers.get("install")!);
                    Array.prototype.push.apply(this.eventHandlers.get("activate"), p.eventHandlers.get("activate")!);
                    this.middlewares.push.apply(this.middlewares, p.middlewares);
                } else {
                    this.middlewares.push(p);
                }
            });
        });

        return this;
    }

    public on(event: "install" | "activate", ...handlers: Array<() => Promise<void> | void>): void {
        Array.prototype.push.apply(this.eventHandlers.get(event)!, handlers);
    }

    private build(): RequestDelegate {
        this.middlewares.push((context: FetchContext) => {
            context.response = fetch(context.request);
            return Promise.resolve();
        });

        return (context: FetchContext) => {
            let index = -1;

            const dispatch = (currentIndex: number): Promise<void> => {
                if (currentIndex <= index) {
                    return Promise.reject(new Error("next() called multiple times"));
                }

                index = currentIndex;

                const middleware: Middleware = this.middlewares[currentIndex];

                return Promise.resolve(middleware(context, dispatch.bind(null, currentIndex + 1)));
            };

            return dispatch(0);
        };
    }
}
