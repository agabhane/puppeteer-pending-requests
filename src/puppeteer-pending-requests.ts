import { Page, Request } from "puppeteer";

export class PuppeteerPendingRequests {
    private _page: Page;
    private _pendingRequests: Set<Request> = new Set();
    private _timeout: number;
    private _resolveCallback: Function;
    private _timer: NodeJS.Timeout;
    private _resourceType: string;

    constructor(page: Page) {
        this._page = page;
        this._onRequest = this._onRequest.bind(this);
        this._onRequestFailed = this._onRequestFailed.bind(this);
        this._onRequestFinished = this._onRequestFinished.bind(this);
    }

    private _onRequest(request: Request) {
        if ((this._resourceType && request.resourceType() === this._resourceType) || !this._resourceType) {
            this._pendingRequests.add(request);
        }
    }

    private _onRequestFailed(request: Request) {
        if ((this._resourceType && request.resourceType() === this._resourceType) || !this._resourceType) {
            this._pendingRequests.delete(request);
            if (this._pendingRequests.size === 0) {
                clearTimeout(this._timer);
                this._setTimer();
            }
        }

    }

    private _onRequestFinished(request: Request) {
        if ((this._resourceType && request.resourceType() === this._resourceType) || !this._resourceType) {
            this._pendingRequests.delete(request);
            if (this._pendingRequests.size === 0) {
                clearTimeout(this._timer);
                this._setTimer();
            }
        }
    }

    private _initializeRequestListeners() {
        this._page.on('request', this._onRequest);
        this._page.on('requestfailed', this._onRequestFailed);
        this._page.on('requestfinished', this._onRequestFinished);
    }

    private _disposeRequestListeners() {
        this._page.removeListener('request', this._onRequest);
        this._page.removeListener('requestfailed', this._onRequestFailed);
        this._page.removeListener('requestfinished', this._onRequestFinished);
    }

    private _setTimer() {
        this._timer = setTimeout(() => {
            if (this._pendingRequests.size === 0) {
                this._resolveCallback();
            }
        }, this._timeout);
    }

    async waitForNetworkIdle(timeout: number = 100, resourceType: string = 'xhr'): Promise<void> {
        this._timeout = timeout;
        this._resourceType = resourceType;
        this._initializeRequestListeners();
        await new Promise(resolve => {
            this._resolveCallback = resolve;
            this._setTimer();
        });
        this._disposeRequestListeners();
    }
}