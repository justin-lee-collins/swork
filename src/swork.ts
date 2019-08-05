import * as builder from "./builder";
import { FetchContext } from "./fetch-context";

/**
 * Defines all support event types.
 */
export type EventType = "activate" | "install" | "message" | "notificationclick" | "notificationclose" | "push" | "pushsubscriptionchange" | "sync";

/**
 * Defines the event handler method signature to be called when an event fires
 */
export type EventHandler = (event: any) => Promise<void> | void;

/**
 * Defines the request delegate used as a request pipeline built from swork
 */
export type RequestDelegate = (context: FetchContext) => Promise<void>;

/**
 * Defines the middleware signature
 */
export type Middleware = (context: FetchContext, next: () => Promise<void>) => Promise<void> | void;

const allEvents = ["activate", "install", "message", "notificationclick", "notificationclose", "push", "pushsubscriptionchange", "sync"];

/**
 * A Swork application. Contains logic to create event handlers and
 * middleware pipeline for a fetch request.
 *
 * @export
 * @class Swork
 */
export class Swork {
    protected middlewares: Middleware[] = [];
    protected eventHandlers: Map<EventType, Array<() => Promise<void> | void>>;

    /**
     * Creates an instance of Swork.
     * @memberof Swork
     */
    constructor() {
        this.eventHandlers = new Map<EventType, Array<() => Promise<void> | void>>();
        allEvents.forEach((x) => {
            this.eventHandlers.set(x as EventType, []);
        });
    }

    /**
     * Registers all event handlers with the associated event and 
     * attaches the middleware pipeline.
     *
     * @memberof Swork
     */
    public listen(): void {
        allEvents.forEach((x) => {
            const handlers = this.eventHandlers.get(x as EventType)!;
            switch (x as EventType) {
                case "activate":
                    builder.add.activate(handlers);
                    break;
                case "install":
                    builder.add.install(handlers);
                    break;
                case "message":
                    builder.add.message(handlers);
                    break;
                case "notificationclick":
                    builder.add.notificationClick(handlers);
                    break;
                case "notificationclose":
                    builder.add.notificationClose(handlers);
                    break;
                case "push":
                    builder.add.push(handlers);
                    break;
                case "pushsubscriptionchange":
                    builder.add.pushSubscriptionChange(handlers);
                    break;
                case "sync":
                    builder.add.sync(handlers);
                    break;
            }
        });

        const delegate = this.build();
        builder.add.fetch(delegate);
    }

    /**
     * Adds a middleware to the fetch request pipeline
     *
     * @param {(...Array<(Swork | Middleware | Array<(Swork | Middleware)>)>)} params
     * @returns {Swork}
     * @memberof Swork
     */
    public use(...params: Array<(Swork | Middleware | Array<(Swork | Middleware)>)>): Swork {
        params.forEach((param) => {
            if (!Array.isArray(param)) {
                param = [param];
            }

            param.forEach((p) => {
                if (p instanceof Swork) {
                    allEvents.forEach((x) => {
                        Array.prototype.push.apply(this.eventHandlers.get(x as EventType), p.eventHandlers.get(x as EventType)!);
                    });

                    this.middlewares.push.apply(this.middlewares, p.middlewares);
                } else {
                    this.middlewares.push(p);
                }
            });
        });

        return this;
    }

    /**
     * Adds an event handler for the provided event type.
     *
     * @param {EventType} event
     * @param {(...Array<(event: any) => Promise<void> | void>)} handlers
     * @memberof Swork
     */
    public on(event: EventType, ...handlers: Array<(event: any) => Promise<void> | void>): void {
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
