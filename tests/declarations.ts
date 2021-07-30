/**
 * VexFlow - Declarations to interface with ./support/qunit.js
 */

/* eslint-disable */

declare global {
  var VF: any;
}
declare const global: any;

export const QUnit = global.QUnit;
export const test = global.test;
export const expect = global.expect;
export const ok = global.ok;
export const notOk = global.notOk;
export const equal = global.equal;
export const notEqual = global.notEqual;
export const deepEqual = global.deepEqual;
export const notDeepEqual = global.notDeepEqual;
export const strictEqual = global.strictEqual;
export const notStrictEqual = global.notStrictEqual;
export const throws = global.throws;

// See: https://api.qunitjs.com/assert/
// TODO: npm install @types/qunit
export interface Assert {
  test: any;
  expect(amount: number): void;
  ok(state: any, message?: string): void;
  notOk(state: any, message?: string): void;
  equal(actual: any, expected: any, message?: string): void;
  notEqual(actual: any, expected: any, message?: string): void;
  deepEqual<T>(actual: T, expected: T, message?: string): void;
  notDeepEqual(actual: any, expected: any, message?: string): void;
  strictEqual<T>(actual: T, expected: T, message?: string): void;
  notStrictEqual(actual: any, expected: any, message?: string): void;
  true(state: any, message?: string): void;
  false(state: any, message?: string): void;
  propEqual(actual: any, expected: any, message?: string): void;
  notPropEqual(actual: any, expected: any, message?: string): void;
  async(acceptCallCount?: number): () => void;
  pushResult(assertResult: { result: boolean; actual: any; expected: any; message: string }): void;
  rejects(promise: Promise<any>, message?: string): Promise<void>;
  rejects(promise: Promise<any>, expectedMatcher?: any, message?: string): Promise<void>;
  step(message: string): void;
  verifySteps(steps: string[], message?: string): void;
  throws(block: () => void, expected?: any, message?: any): void;
  raises(block: () => void, expected?: any, message?: any): void;
}
