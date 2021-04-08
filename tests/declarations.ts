/**
 * VexFlow - Declarations to interface with ./support/qunit.js
 */

// eslint-disable-next-line
declare const global: any;

export const QUnit = global.QUnit;
export const ok = global.ok;
export const notOk = global.notOk;
export const test = global.test;
export const expect = global.expect;
export const equal = global.equal;
export const notEqual = global.notEqual;
export const deepEqual = global.deepEqual;
export const notDeepEqual = global.notDeepEqual;
export const strictEqual = global.strictEqual;
export const notStrictEqual = global.notStrictEqual;
