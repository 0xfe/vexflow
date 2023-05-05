/** `RuntimeError` will be thrown by VexFlow classes in case of error. */
export declare class RuntimeError extends Error {
    code: string;
    constructor(code: string, message?: string);
}
/** VexFlow can be used outside of the browser (e.g., Node) where `window` may not be defined. */
export declare function globalObject(): typeof globalThis & any;
/**
 * Check that `x` is of type `T` and not `undefined`.
 * If `x` is `undefined`, throw a RuntimeError with the optionally provided error code and message.
 */
export declare function defined<T>(x?: T, code?: string, message?: string): T;
/** Default log function sends all arguments to console. */
export declare function log(block: string, ...args: any[]): void;
/** Dump warning to console. */
export declare function warn(...args: any[]): void;
/** Locate the mid point between stave lines. Returns a fractional line if a space. */
export declare function midLine(a: number, b: number): number;
/**
 * Used by various classes (e.g., SVGContext) to provide a
 * unique prefix to element names (or other keys in shared namespaces).
 */
export declare function prefix(text: string): string;
/**
 * Convert an arbitrary angle in radians to the equivalent one in the range [0, pi).
 */
export declare function normalizeAngle(a: number): number;
/**
 * Return the sum of an array of numbers.
 */
export declare function sumArray(arr: number[]): number;
