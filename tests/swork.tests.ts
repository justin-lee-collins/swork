import { RequestDelegate } from "../src/abstractions";
import * as builder from "../src/builder";
import { FetchContext } from "../src/fetch-context";
import { Swork } from "../src/swork";
import { getFetchEvent, mockInit } from "./mock-helper";

// tslint:disable-next-line:no-string-literal
const build = (app: Swork) => app["build"]();
// tslint:disable-next-line:no-empty
const noopHandler = () => {};

describe("Swork tests", () => {
    let app: Swork;

    beforeEach(() => {
        mockInit();
        app = new Swork();
    });

    test("basic", async (done) => {
        let middlewareCalled = false;

        app.use(async (context: FetchContext, next: RequestDelegate) => await next(context),
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

        app.use(async (context: FetchContext, next: RequestDelegate) => {
            middlewareCallLocations.push("Swork");
            return await next(context);
        });

        const app2 = new Swork();

        app2.use(async (context: FetchContext, next: RequestDelegate) => {
            middlewareCallLocations.push("Swork2");
            return await next(context);
        });

        const app3 = new Swork();

        app3.use((context: FetchContext) => {
            middlewareCallLocations.push("Swork3");
        });

        app.use(app2, app3);

        const requestDelegate = build(app);

        await requestDelegate(new FetchContext(getFetchEvent("http://www.google.com")));

        expect(middlewareCallLocations.length).toBe(3);
        expect(middlewareCallLocations[0]).toBe("Swork");
        expect(middlewareCallLocations[1]).toBe("Swork2");
        expect(middlewareCallLocations[2]).toBe("Swork3");

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
        const installMock = builder.add.install = jest.fn();
        const fetchMock = builder.add.fetch = jest.fn();

        app.listen();

        expect(activateMock.mock.calls.length).toBe(0);
        expect(installMock.mock.calls.length).toBe(0);
        expect(fetchMock.mock.calls.length).toBe(1);

        app.on("install", noopHandler);
        app.on("activate", noopHandler);
        app.listen();

        expect(activateMock.mock.calls.length).toBe(1);
        expect(installMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls.length).toBe(2);
    });

    test("on creates one array per event type", () => {
        app.on("install", noopHandler);

        // tslint:disable-next-line:no-string-literal
        const array = app["eventHandlers"].get("install")!;

        app.on("install", noopHandler);

        // tslint:disable-next-line:no-string-literal
        expect(array).toStrictEqual(app["eventHandlers"].get("install")!);
    });
});
