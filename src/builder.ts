import { FetchContext } from "./fetch-context";
import { EventHandler, EventType, RequestDelegate } from "./swork";

function addExtendableEvent(eventType: EventType, handlers: EventHandler[]) {
    if (handlers.length) {
        self.addEventListener(eventType, eventListeners.extendableEvent(handlers));
    }
}

function addFetchEvent(delegate: RequestDelegate) {
    self.addEventListener("fetch", eventListeners.fetchEvent(delegate));
}

function getExtendableEventListener(handlers: EventHandler[]): EventListenerOrEventListenerObject {
    const handler = eventHandlers.extendableEvent(handlers);
    
    return async (event) => {
        (event as ExtendableEvent).waitUntil(handler(event as ExtendableEvent));
    };
}

function getFetchEventListener(delegate: RequestDelegate): EventListenerOrEventListenerObject {
    return (event) => {
        const fetchEvent = event as FetchEvent;

        const handler = eventHandlers.fetchEvent(delegate, fetchEvent);

        fetchEvent.waitUntil(handler);
        fetchEvent.respondWith(handler);
    };
}

function getExtendableEventHandler(handlers: EventHandler[]) {
    return async (event: ExtendableEvent) => {
        await Promise.all(handlers.map(async (handler) => {
            try {
                await handler(event);
            } catch (e) {
                console.error(e);
            }
        }));
    };
}

function getFetchEventHandler(delegate: RequestDelegate, fetchEvent: FetchEvent): Promise<Response> {
    return (async () => {
        const fetchContext = new FetchContext(fetchEvent);

        try {
            await delegate(fetchContext);
        } catch (e) {
            console.error(e);
        }
        
        return fetchContext.response;
    })();
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
