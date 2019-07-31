export class FetchContext {
    public request: Request;
    public event: FetchEvent;
    public response!: Promise<Response> | Response;
    
    constructor(event: FetchEvent) {
        this.event = event;
        this.request = event.request;
    }
}
