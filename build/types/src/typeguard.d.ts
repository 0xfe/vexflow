/**
 * Use instead of `instanceof` as a more flexible type guard.
 * @param obj check if this object is an instance of the provided `cls`.
 * @param cls a JavaScript class, such as `StaveNote`. `cls` is a constructor function, and it has a `prototype` property, and
 *            optionally a `CATEGORY` property (used in VexFlow for flexible type checking).
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `CATEGORY`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` is an instance of `ClassName`, or has a static `CATEGORY` property that matches `ClassName.CATEGORY`.
 */
export declare function isCategory<T>(obj: any, cls: Function & {
    prototype: T;
    CATEGORY?: string;
}, checkAncestors?: boolean): obj is T;
