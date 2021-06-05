// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Fraction class that represents a rational number
//
// @author zz85
// @author incompleteopus (modifications)

import { RuntimeError } from './util';

/** Fraction represents a rational number. */
export class Fraction {
  numerator: number = 1;

  denominator: number = 1;

  // Cached objects for comparisons
  private static __staticFractionA = new Fraction();

  private static __staticFractionB = new Fraction();

  private static __staticFractionTmp = new Fraction();

  /**
   * GCD: Greatest common divisor using Euclidean algorithm.
   */
  static GCD(a: number, b: number): number {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new RuntimeError('BadArgument', `Invalid numbers: ${a}, ${b}`);
    }

    let t;

    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }

    return a;
  }

  /**
   * LCM: Lowest common multiple.
   */
  static LCM(a: number, b: number): number {
    return (a * b) / Fraction.GCD(a, b);
  }

  /**
   * LCMM: Lowest common multiple for more than two numbers.
   */
  static LCMM(
    // eslint-disable-next-line
    args: any): number {
    if (args.length === 0) {
      return 0;
    }
    if (args.length === 1) {
      return args[0];
    }
    if (args.length === 2) {
      return Fraction.LCM(args[0], args[1]);
    }
    const arg0 = args[0];
    args.shift();
    return Fraction.LCM(arg0, Fraction.LCMM(args));
  }

  /** Constructs providing numerator and denominator. */
  constructor(numerator?: number, denominator?: number) {
    this.set(numerator, denominator);
  }

  /** Sets numerator and denominator. */
  set(numerator: number = 1, denominator: number = 1): this {
    this.numerator = numerator;
    this.denominator = denominator;
    return this;
  }

  /** Returns the value of the fraction. */
  value(): number {
    return this.numerator / this.denominator;
  }

  /** Simplifies numerator and denominator using GCD. */
  simplify(): this {
    let u = this.numerator;
    let d = this.denominator;

    const gcd = Fraction.GCD(u, d);
    u /= gcd;
    d /= gcd;

    if (d < 0) {
      d = -d;
      u = -u;
    }
    return this.set(u, d);
  }

  /** Adds value of another fraction. */
  add(param1: Fraction | number = 0, param2: number = 1): this {
    let otherNumerator: number;
    let otherDenominator: number;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      otherNumerator = param1;
      otherDenominator = param2;
    }

    const lcm = Fraction.LCM(this.denominator, otherDenominator);
    const a = lcm / this.denominator;
    const b = lcm / otherDenominator;

    const u = this.numerator * a + otherNumerator * b;
    return this.set(u, lcm);
  }

  /** Substracts value of another fraction. */
  subtract(param1: Fraction | number = 0, param2: number = 1): this {
    let otherNumerator: number;
    let otherDenominator: number;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      otherNumerator = param1;
      otherDenominator = param2;
    }

    const lcm = Fraction.LCM(this.denominator, otherDenominator);
    const a = lcm / this.denominator;
    const b = lcm / otherDenominator;

    const u = this.numerator * a - otherNumerator * b;
    return this.set(u, lcm);
  }

  /** Multiplies by value of another fraction. */
  multiply(param1: Fraction | number = 1, param2: number = 1): this {
    let otherNumerator: number;
    let otherDenominator: number;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      otherNumerator = param1;
      otherDenominator = param2;
    }

    return this.set(this.numerator * otherNumerator, this.denominator * otherDenominator);
  }

  /** Divides by value of another Fraction. */
  divide(param1: Fraction | number = 1, param2: number = 1): this {
    let otherNumerator: number;
    let otherDenominator: number;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      otherNumerator = param1;
      otherDenominator = param2;
    }

    return this.set(this.numerator * otherDenominator, this.denominator * otherNumerator);
  }

  /** Simplifies both sides and checks if they are equal. */
  equals(compare: Fraction | number): boolean {
    const a = Fraction.__staticFractionA.copy(compare).simplify();
    const b = Fraction.__staticFractionB.copy(this).simplify();

    return a.numerator === b.numerator && a.denominator === b.denominator;
  }

  /** Greater than operator. */
  greaterThan(compare: Fraction | number): boolean {
    const a = Fraction.__staticFractionB.copy(this);
    a.subtract(compare);
    return a.numerator > 0;
  }

  /** Greater than or equals operator. */
  greaterThanEquals(compare: Fraction | number): boolean {
    const a = Fraction.__staticFractionB.copy(this);
    a.subtract(compare);
    return a.numerator >= 0;
  }

  /** Less than operator. */
  lessThan(compare: Fraction | number): boolean {
    return !this.greaterThanEquals(compare);
  }

  /** Less than or equals operator. */
  lessThanEquals(compare: Fraction | number): boolean {
    return !this.greaterThan(compare);
  }

  /** Returns a new copy with current values. */
  clone(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }

  /** Copies value of another fraction. */
  copy(copy: Fraction | number): this {
    if (typeof copy === 'number') {
      return this.set(copy || 0, 1);
    }
    return this.set(copy.numerator, copy.denominator);
  }

  /** Returns the integer component (eg. 5/2 => 2). */
  quotient(): number {
    return Math.floor(this.numerator / this.denominator);
  }

  /** Returns the remainder component (eg. 5/2 => 1). */
  remainder(): number {
    return this.numerator % this.denominator;
  }

  /** Calculates absolute value. */
  makeAbs(): this {
    this.denominator = Math.abs(this.denominator);
    this.numerator = Math.abs(this.numerator);
    return this;
  }

  /** Returns a raw string representation (eg. "5/2"). */
  toString(): string {
    return `${this.numerator}/${this.denominator}`;
  }

  /** Returns a simplified string respresentation. */
  toSimplifiedString(): string {
    return Fraction.__staticFractionTmp.copy(this).simplify().toString();
  }

  /** Returns string representation in mixed form. */
  toMixedString(): string {
    let s = '';
    const q = this.quotient();
    const f = Fraction.__staticFractionTmp.copy(this);

    if (q < 0) {
      f.makeAbs();
    }

    if (q !== 0) {
      s += q;

      if (f.numerator !== 0) {
        s += ` ${f.toSimplifiedString()}`;
      }
    } else if (f.numerator === 0) {
      s = '0';
    } else {
      s = f.toSimplifiedString();
    }

    return s;
  }

  /** Parses a fraction string. */
  parse(str: string): this {
    const i = str.split('/');
    const n = parseInt(i[0], 10);
    const d = i[1] ? parseInt(i[1], 10) : 1;

    return this.set(n, d);
  }
}
