// @ts-ignore
import * as FetchEvent from "service-worker-mock/models/FetchEvent";
import { EventHandler, RequestDelegate } from "../src/abstractions";
import * as builder from "../src/builder";
import { FetchContext } from "../src/fetch-context";
import { getFetchEvent, mockInit } from "./mock-helper";

describe("Service worker builder tests", () => {
    const fetchEvent = getFetchEvent("http://www.google.com");

    beforeEach(() => {
        mockInit();
    });

    test("fetchEvent eventHandler", async (done) => {
        let delegateCalled = false;
        const handler = builder.eventHandlers.fetchEvent((context: FetchContext) => {
            delegateCalled = true;
        }, fetchEvent);

        await handler();

        expect(delegateCalled).toBe(true);

        done();
    });

    test("fetchEvent eventHandler catches and logs", async (done) => {
        // tslint:disable-next-line:no-console
        const errorMock = console.error = jest.fn();
        const handler = builder.eventHandlers.fetchEvent((context: FetchContext) => {
            throw new Error("error");
        }, fetchEvent);

        await handler();

        expect(errorMock.mock.calls.length).toBe(1);

        done();
    });

    test("extendableEvent eventHandler", async (done) => {
        let delegateCalled = false;
        const handler = builder.eventHandlers.extendableEvent([() => {
            delegateCalled = true;
        }]);

        await handler();

        expect(delegateCalled).toBe(true);

        done();
    });

    test("extendableEvent eventHandler catches and logs", async (done) => {
        // tslint:disable-next-line:no-console
        const errorMock = console.error = jest.fn();
        const handler = builder.eventHandlers.extendableEvent([() => {
            throw new Error("error");
        }]);

        await handler();

        expect(errorMock.mock.calls.length).toBe(1);

        done();
    });

    test("fetchEvent eventListener", () => {
        // tslint:disable-next-line:no-empty
        const handlerMock = jest.fn(() => () => {});

        builder.eventHandlers.fetchEvent = handlerMock as unknown as (delegate: RequestDelegate, fetchEvent: FetchEvent) => () => Promise<void>;

        // tslint:disable-next-line:no-empty
        const delegate: RequestDelegate = (context: FetchContext) => {};

        const listener = builder.eventListeners.fetchEvent(delegate) as EventListener;

        listener(fetchEvent as unknown as Event);

        expect(handlerMock).toHaveBeenCalledTimes(1);
    });

    test("extendableEvent eventListener", () => {
        // tslint:disable-next-line:no-empty
        const handlerMock = jest.fn(() => () => {});

        builder.eventHandlers.extendableEvent = handlerMock as unknown as (handlers: EventHandler[]) => () => Promise<void>;

        // tslint:disable-next-line:no-empty
        const listener = builder.eventListeners.extendableEvent([() => {}]) as EventListener;

        listener(fetchEvent as unknown as Event);

        expect(handlerMock).toHaveBeenCalledTimes(1);
    });

    test("add activate", () => {
        // tslint:disable-next-line:no-empty
        const listenerMock = jest.fn(() => {});        
        const addEventListenerMock = self.addEventListener = jest.fn();  

        builder.eventListeners.extendableEvent = listenerMock as unknown as (handlers: EventHandler[]) => EventListenerOrEventListenerObject;

        builder.add.activate([]);

        expect(listenerMock).not.toHaveBeenCalled();
        expect(addEventListenerMock).not.toHaveBeenCalled();

        // tslint:disable-next-line:no-empty
        builder.add.activate([() => {}]);

        expect(listenerMock).toHaveBeenCalledTimes(1);
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    });

    test("add install", () => {
        // tslint:disable-next-line:no-empty
        const listenerMock = jest.fn(() => {});
        const addEventListenerMock = self.addEventListener = jest.fn();  

        builder.eventListeners.extendableEvent = listenerMock as unknown as (handlers: EventHandler[]) => EventListenerOrEventListenerObject;

        builder.add.install([]);

        expect(listenerMock).not.toHaveBeenCalled();        
        expect(addEventListenerMock).not.toHaveBeenCalled();

        // tslint:disable-next-line:no-empty
        builder.add.install([() => {}]);

        expect(listenerMock).toHaveBeenCalledTimes(1);        
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    });

    test("add fetch", () => {
        // tslint:disable-next-line:no-empty
        const listenerMock = jest.fn(() => {});        
        const addEventListenerMock = self.addEventListener = jest.fn();  

        builder.eventListeners.fetchEvent = listenerMock as unknown as (delegate: RequestDelegate) => EventListenerOrEventListenerObject;

        // tslint:disable-next-line:no-empty
        builder.add.fetch((context: FetchContext) => {});

        expect(listenerMock).toHaveBeenCalledTimes(1);        
        expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    });
});
