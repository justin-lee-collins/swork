import { EventHandler, EventType, RequestDelegate } from "./abstractions";
import { FetchContext } from "./fetch-context";

function addExtendableEvent(eventType: EventType, handlers: EventHandler[]) {
    if (handlers.length) {
        self.addEventListener(eventType, eventListeners.extendableEvent(handlers));
    }
}

function addFetchEvent(delegate: RequestDelegate) {
    self.addEventListener("fetch", eventListeners.fetchEvent(delegate));
}

function getExtendableEventListener(handlers: EventHandler[]): EventListenerOrEventListenerObject {
    return (event) => {
        (event as ExtendableEvent).waitUntil(eventHandlers.extendableEvent(handlers)());
    };
}

function getFetchEventListener(delegate: RequestDelegate): EventListenerOrEventListenerObject {
    return (event) => {
        const fetchEvent = event as FetchEvent;
        fetchEvent.waitUntil(eventHandlers.fetchEvent(delegate, fetchEvent)());
    };
}

function getExtendableEventHandler(handlers: EventHandler[]) {
    return (async () => {
        await Promise.all(handlers.map(async (handler) => {
            try {
                await handler();
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        }));
    });
}

function getFetchEventHandler(delegate: RequestDelegate, fetchEvent: FetchEvent) {
    return (async () => {
        const fetchContext = new FetchContext(fetchEvent);
        try {
            await delegate(fetchContext);
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    });
}

export const add = {
    activate: (handlers: EventHandler[]) => addExtendableEvent("activate", handlers),
    fetch: addFetchEvent,
    install: (handlers: EventHandler[]) => addExtendableEvent("install", handlers),
};

export const eventListeners = {
    extendableEvent: getExtendableEventListener,
    fetchEvent: getFetchEventListener,
};

export const eventHandlers = {
    extendableEvent: getExtendableEventHandler,
    fetchEvent: getFetchEventHandler,
};
