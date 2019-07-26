import { FetchContext } from "./fetch-context";

/**
 * 
 */
export type EventType = "activate" | "install";

/**
 * 
 */
export type EventHandler = () => Promise<void> | void;

/**
 * Defines the method to be used during the request pipeline
 *
 * @export
 * @type RequestDelegate
 */
export type RequestDelegate = (context: FetchContext) => Promise<void> | void;
