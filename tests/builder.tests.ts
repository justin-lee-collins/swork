// @ts-ignore
import * as ExtendableEvent from "service-worker-mock/models/ExtendableEvent";
// @ts-ignore
import * as FetchEvent from "service-worker-mock/models/FetchEvent";
// @ts-ignore
import * as Response from "service-worker-mock/models/Response";
import * as builder from "../src/builder";
import { FetchContext } from "../src/fetch-context";
import { EventHandler, RequestDelegate } from "../src/swork";
import { getFetchEvent, mockInit } from "./mock-helper";

describe("Service worker builder tests", () => {
    let fetchEvent: FetchEvent;

    const fetchListenerFactory = builder.eventListeners.fetchEvent;
    const eventListenerFactory = builder.eventListeners.extendableEvent;

    const fetchHandlerFactory = builder.eventHandlers.fetchEvent;
    const eventHandlerFactory = builder.eventHandlers.extendableEvent;

    beforeEach(() => {
        mockInit();

        fetchEvent = getFetchEvent("http://www.google.com");

        builder.eventListeners.fetchEvent = fetchListenerFactory;
        builder.eventListeners.extendableEvent = eventListenerFactory;

        builder.eventHandlers.fetchEvent = fetchHandlerFactory;
        builder.eventHandlers.extendableEvent = eventHandlerFactory;
    });

    function eventAddTest(add: (handlers: EventHandler[]) => void) {
        const listenerMock = jest.fn(() => {});
        const addEventListenerMock = self.addEventListener = jest.fn();  

        builder.eventListeners.extendableEvent = listenerMock as unknown as (handlers: EventHandler[]) => EventListenerOrEventListenerObject;

        add([]);

        expect(listenerMock).not.toHaveBeenCalled();        
        expect(addEventListenerMock).not.toHaveBeenCalled();

        add([() => {}]);

        expect(listenerMock).toHaveBeenCalledTimes(1);        
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    }

    test("fetchEvent eventHandler", async (done) => {
        let delegateCalled = false;
        const handler = builder.eventHandlers.fetchEvent((context: FetchContext) => {
            delegateCalled = true;
            return Promise.resolve();
        }, fetchEvent);

        await handler;

        expect(delegateCalled).toBe(true);

        done();
    });

    test("fetchEvent eventHandler catches and logs", async (done) => {
        const errorMock = console.error = jest.fn();
        const handler = builder.eventHandlers.fetchEvent((context: FetchContext) => {
            throw new Error("error");
        }, fetchEvent);

        await handler;

        expect(errorMock.mock.calls.length).toBe(1);

        done();
    });

    test("extendableEvent eventHandler", async (done) => {
        let delegateCalled = false;
        const event = new ExtendableEvent();

        const handler = builder.eventHandlers.extendableEvent([() => {
            delegateCalled = true;
        }]);

        await handler(event);

        expect(delegateCalled).toBe(true);

        done();
    });

    test("extendableEvent eventHandler catches and logs", async (done) => {
        const errorMock = console.error = jest.fn();
        const event = new ExtendableEvent();
        const handler = builder.eventHandlers.extendableEvent([() => {
            throw new Error("error");
        }]);

        await handler(event);

        expect(errorMock.mock.calls.length).toBe(1);

        done();
    });

    test("fetchEvent eventListener", () => {
        const handlerMock = jest.fn(() => {});

        builder.eventHandlers.fetchEvent = handlerMock as unknown as (delegate: RequestDelegate, fetchEvent: FetchEvent) => Promise<Response>;

        const delegate: RequestDelegate = (context: FetchContext) => Promise.resolve();

        const listener = builder.eventListeners.fetchEvent(delegate) as EventListener;

        listener(fetchEvent as unknown as Event);

        expect(handlerMock).toHaveBeenCalledTimes(1);
    });

    test("extendableEvent eventListener", () => {
        const handlerMock = jest.fn(() => () => {});

        builder.eventHandlers.extendableEvent = handlerMock as unknown as (handlers: EventHandler[]) => () => Promise<void>;

        const listener = builder.eventListeners.extendableEvent([() => {}]) as EventListener;

        listener(fetchEvent as unknown as Event);

        expect(handlerMock).toHaveBeenCalledTimes(1);
    });

    test("add activate", () => {
        eventAddTest(builder.add.activate);
    });
    
    test("add install", () => {
        eventAddTest(builder.add.install);
    });

    test("add message", () => {
        eventAddTest(builder.add.message);
    });

    test("add notificationClick", () => {
        eventAddTest(builder.add.notificationClick);
    });

    test("add notificationClose", () => {
        eventAddTest(builder.add.notificationClose);
    });

    test("add push", () => {
        eventAddTest(builder.add.push);
    });

    test("add pushSubscriptionChange", () => {
        eventAddTest(builder.add.pushSubscriptionChange);
    });

    test("add sync", () => {
        eventAddTest(builder.add.sync);
    });

    test("add fetch", () => {
        const listenerMock = jest.fn(() => {});        
        const addEventListenerMock = self.addEventListener = jest.fn();  

        builder.eventListeners.fetchEvent = listenerMock as unknown as (delegate: RequestDelegate) => EventListenerOrEventListenerObject;

        builder.add.fetch(() => Promise.resolve());

        expect(listenerMock).toHaveBeenCalledTimes(1);        
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    });

    test("respondWith|waitUntil called on fetch event", () => {
        fetchEvent.respondWith = jest.fn();
        fetchEvent.waitUntil = jest.fn();

        const listener = builder.eventListeners.fetchEvent((context: FetchContext) => Promise.resolve()) as EventListener;

        listener(fetchEvent);

        expect(fetchEvent.respondWith).toBeCalledTimes(1);
        expect(fetchEvent.waitUntil).toBeCalledTimes(1);
    });
});
