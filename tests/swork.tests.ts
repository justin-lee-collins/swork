import * as builder from "../src/builder";
import { FetchContext } from "../src/fetch-context";
import { Swork } from "../src/swork";
import { getFetchEvent, mockInit } from "./mock-helper";

// tslint:disable-next-line:no-string-literal
const build = (app: Swork) => app["build"]();
const noopHandler = () => {};

declare var global: any;

describe("Swork tests", () => {
    let app: Swork;

    beforeEach(() => {
        mockInit();
        app = new Swork();
    });

    test("basic", async (done) => {
        let middlewareCalled = false;

        app.use(async (context: FetchContext, next: () => Promise<void>) => await next(),
            (context: FetchContext) => {
                middlewareCalled = true;
            });

        const requestDelegate = build(app);

        await requestDelegate(new FetchContext(getFetchEvent("http://www.google.com")));

        expect(middlewareCalled).toBe(true);

        done();
    });

    test("app chain", async (done) => {
        const middlewareCallLocations: string[] = [];

        app.use(async (context: FetchContext, next: () => Promise<void>) => {
            middlewareCallLocations.push("Swork");
            return await next();
        });

        const app2 = new Swork();

        app2.use(async (context: FetchContext, next: () => Promise<void>) => {
            middlewareCallLocations.push("Swork2");
            return await next();
        });

        app2.on("activate", noopHandler);

        const app3 = new Swork();

        app3.use((context: FetchContext) => {
            middlewareCallLocations.push("Swork3");
        });

        app3.on("install", noopHandler);

        app.use(app2, app3);

        const requestDelegate = build(app);

        await requestDelegate(new FetchContext(getFetchEvent("http://www.google.com")));

        expect(middlewareCallLocations.length).toBe(3);
        expect(middlewareCallLocations[0]).toBe("Swork");
        expect(middlewareCallLocations[1]).toBe("Swork2");
        expect(middlewareCallLocations[2]).toBe("Swork3");

        // tslint:disable-next-line:no-string-literal
        const installHandlers = app["eventHandlers"].get("install")!;
        expect(installHandlers.length).toBe(1);
        expect(installHandlers[0]).toStrictEqual(noopHandler);

        // tslint:disable-next-line:no-string-literal
        const activateHandler = app["eventHandlers"].get("activate")!;
        expect(activateHandler.length).toBe(1);
        expect(activateHandler[0]).toStrictEqual(noopHandler); 

        done();
    });

    test("default has fetch", async (done) => {
        const mockFetch = jest.fn();

        Object.assign(global, {
            fetch: mockFetch,
        });

        const delegate = build(app);

        await delegate(new FetchContext(getFetchEvent("http://www.example.com")));

        expect(mockFetch.mock.calls.length).toBe(1);

        done();
    });

    test("listen calls builder", () => {
        
        const activateMock = builder.add.activate = jest.fn();
        const fetchMock = builder.add.fetch = jest.fn();
        const installMock = builder.add.install = jest.fn();
        const messageMock = builder.add.message = jest.fn();
        const notificationClickMock = builder.add.notificationClick = jest.fn();
        const notificationCloseMock = builder.add.notificationClose = jest.fn();
        const pushMock = builder.add.push = jest.fn();
        const pushSubscriptionChangeMock = builder.add.pushSubscriptionChange = jest.fn();        
        const syncMock = builder.add.sync = jest.fn();

        app.listen();

        expect(activateMock).toBeCalledTimes(1);
        expect(fetchMock).toBeCalledTimes(1);
        expect(installMock).toBeCalledTimes(1);
        expect(messageMock).toBeCalledTimes(1);
        expect(notificationClickMock).toBeCalledTimes(1);
        expect(notificationCloseMock).toBeCalledTimes(1);
        expect(pushMock).toBeCalledTimes(1);
        expect(pushSubscriptionChangeMock).toBeCalledTimes(1);
        expect(syncMock).toBeCalledTimes(1);
    });

    test("next called multiple times errors", async (done) => {
        let error: Error | null = null;

        app.use(async (context: FetchContext, next: () => Promise<void>) => {
            await next();
            try {
                await next();
            } catch (e) {
                error = e;
            }
        });

        const delegate = build(app);
        await delegate(getFetchEvent("http://www.google.com"));

        expect(error!.message).toBe("next() called multiple times");

        done();
    });

    test("async error gets bubbled up", async (done) => {
        app.use(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            throw new Error("A bad thing happened.");
        });

        const delegate = build(app);

        try {
            await delegate(getFetchEvent("http://www.google.com"));
        } catch (e) {
            expect(e.message).toBe("A bad thing happened.");
        }

        done();
    });

    test("non async response works", async (done) => {
        const response = new Response("asdf");

        app.use((c: FetchContext) => {
            c.response = response;
        });

        const delegate = build(app);

        const context = new FetchContext(getFetchEvent("http://www.google.com"));

        await delegate(context);

        expect(context.response).toStrictEqual(response);

        done();
    });

    test("use supports array", async (done) => {
        const middleware = jest.fn();
        app.use([middleware, middleware, middleware]);

        const delegate = build(app);

        await delegate(getFetchEvent("http://www.google.com"));

        expect(middleware).toBeCalledTimes(1);

        done();
    });
});
