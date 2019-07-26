import { FetchContext } from "../src/fetch-context";
import { getFetchEvent, mockInit } from "./mock-helper";

describe("Fetch context tests", () => {

    beforeEach(() => {
        mockInit();
    });

    test("responseWith", async (done) => {
        const fetchEvent = getFetchEvent("http://www.example.com");
        fetchEvent.respondWith = jest.fn();

        const fetchContext = new FetchContext(fetchEvent);

        const response = new Response("Hello World");

        fetchContext.respondWith(response);

        expect(fetchContext.response).toStrictEqual(response);
        expect(fetchEvent.respondWith).toBeCalledTimes(1);        

        done();
    });
});
