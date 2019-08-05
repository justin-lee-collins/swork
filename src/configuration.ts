interface IConfiguration {
    version: string;
    origin: string;
    environment: "production" | "development";
}

declare global {
    // tslint:disable-next-line:interface-name
    interface WorkerGlobalScope {
        _swork: IConfiguration;
    }
}

if (!self._swork) {
    self._swork = {
        environment: "production",
        origin: self.location.origin,
        version: "1.0.0",
    } as IConfiguration;
}

/**
 * Contains swork global configurations.
 *
 * @class Configuration
 * @implements {IConfiguration}
 */
class Configuration implements IConfiguration {
    /**
     * Defines the version of the service worker.
     *
     * @type {string}
     * @memberof Configuration
     */
    public get version() {
        return self._swork.version;
    }

    public set version(value: string) {
        self._swork.version = value;
    }

    /**
     * Defines the origin of the service worker. If not provided,
     * the value will be pulled from the origin of the service
     * worker's location.
     *
     * @type {string}
     * @memberof Configuration
     */
    public get origin(): string {
        return self._swork.origin;
    }

    public set origin(value: string) {
        self._swork.origin = value;
    }

    /**
     * Defines the current build type of the service worker. Supported
     * values include "development" and "production". 
     *
     * @type {("production" | "development")}
     * @memberof Configuration
     */
    public get environment(): "production" | "development" {
        return self._swork.environment;
    }

    public set environment(value: "production" | "development") {
        self._swork.environment = value;
    }
}

export const configuration = new Configuration();
