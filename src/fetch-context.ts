export class FetchContext {
    public request: Request;
    public event: FetchEvent;
    public response!: Promise<Response> | Response;
    
    constructor(event: FetchEvent) {
        this.event = event;
        this.request = event.request;
    }

    public respondWith(response: Promise<Response> | Response) {
        this.response = response;
        this.event.respondWith(response);
    }
}
