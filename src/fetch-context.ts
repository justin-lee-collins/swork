export class FetchContext {
    /**
     * The request object that generated the FetchEvent
     *
     * @type {Request}
     * @memberof FetchContext
     */
    public request: Request;

    /**
     * The fetch event associated with the request
     *
     * @type {FetchEvent}
     * @memberof FetchContext
     */
    public event: FetchEvent;

    /**
     * The expected response to the request.
     *
     * @type {(Promise<Response> | Response)}
     * @memberof FetchContext
     */
    public response!: Promise<Response> | Response;
    
    constructor(event: FetchEvent) {
        this.event = event;
        this.request = event.request;
    }
}
