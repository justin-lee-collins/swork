// tslint:disable-next-line:interface-name
export interface Configuration {

    /**
     * Defines the version of the service worker.
     *
     * @type {string}
     * @memberof Configuration
     */
    version: string;

    /**
     * Defines the origin of the service worker. If not provided,
     * the value will be pulled from the origin of the service
     * worker's location.
     *
     * @type {string}
     * @memberof Configuration
     */
    origin: string;

    /**
     * Defines the current build type of the service worker. Supported
     * values include "development" and "production". 
     *
     * @type {("production" | "development")}
     * @memberof Configuration
     */
    environment: "production" | "development";
}

export const configuration = {
    environment: "production",
    origin: self.location.origin,
    version: "1.0.0",
} as Configuration;
