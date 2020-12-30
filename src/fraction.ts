// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Fraction class that represents a rational number
//
// @author zz85
// @author incompleteopus (modifications)

/* eslint-disable no-underscore-dangle */
import {RuntimeError} from "./runtimeerror";

export class Fraction {
  numerator: any;
  denominator: any;

  private static __compareA = new Fraction();
  private static __compareB = new Fraction();
  private static __tmp = new Fraction();

  /**
   * GCD: Find greatest common divisor using Euclidean algorithm
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
   * LCM: Lowest common multiple
   */
  static LCM(a: number, b: number): number {
    return ((a * b) / Fraction.GCD(a, b));
  }

  /**
   * LCMM: Lowest common multiple for more than two numbers
   */
  static LCMM(args: any): number {
    if (args.length === 0) {
      return 0;
    } else if (args.length === 1) {
      return args[0];
    } else if (args.length === 2) {
      return Fraction.LCM(args[0], args[1]);
    } else {
      const arg0 = args[0];
      args.shift();
      return Fraction.LCM(arg0, Fraction.LCMM(args));
    }
  }

  constructor(numerator?: number, denominator?: number) {
    this.set(numerator, denominator);
  }

  set(numerator: number, denominator: number): this {
    this.numerator = numerator === undefined ? 1 : numerator;
    this.denominator = denominator === undefined ? 1 : denominator;
    return this;
  }

  value(): number {
    return this.numerator / this.denominator;
  }

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

  add(param1: any, param2?: any): this {
    let otherNumerator;
    let otherDenominator;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      if (param1 !== undefined) {
        otherNumerator = param1;
      } else {
        otherNumerator = 0;
      }

      if (param2 !== undefined) {
        otherDenominator = param2;
      } else {
        otherDenominator = 1;
      }
    }

    const lcm = Fraction.LCM(this.denominator, otherDenominator);
    const a = lcm / this.denominator;
    const b = lcm / otherDenominator;

    const u = this.numerator * a + otherNumerator * b;
    return this.set(u, lcm);
  }

  subtract(param1: Fraction, param2?: Fraction): this {
    let otherNumerator;
    let otherDenominator;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      if (param1 !== undefined) {
        otherNumerator = param1;
      } else {
        otherNumerator = 0;
      }

      if (param2 !== undefined) {
        otherDenominator = param2;
      } else {
        otherDenominator = 1;
      }
    }

    const lcm = Fraction.LCM(this.denominator, otherDenominator);
    const a = lcm / this.denominator;
    const b = lcm / otherDenominator;

    const u = this.numerator * a - otherNumerator * b;
    return this.set(u, lcm);
  }

  multiply(param1: any, param2?: any): this {
    let otherNumerator;
    let otherDenominator;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      if (param1 !== undefined) {
        otherNumerator = param1;
      } else {
        otherNumerator = 1;
      }

      if (param2 !== undefined) {
        otherDenominator = param2;
      } else {
        otherDenominator = 1;
      }
    }

    return this.set(this.numerator * otherNumerator, this.denominator * otherDenominator);
  }

  divide(param1: Fraction, param2: Fraction): this {
    let otherNumerator;
    let otherDenominator;

    if (param1 instanceof Fraction) {
      otherNumerator = param1.numerator;
      otherDenominator = param1.denominator;
    } else {
      if (param1 !== undefined) {
        otherNumerator = param1;
      } else {
        otherNumerator = 1;
      }

      if (param2 !== undefined) {
        otherDenominator = param2;
      } else {
        otherDenominator = 1;
      }
    }

    return this.set(this.numerator * otherDenominator, this.denominator * otherNumerator);
  }

  // Simplifies both sides and checks if they are equal.
  equals(compare: Fraction|number): boolean {
    const a = Fraction.__compareA.copy(compare).simplify();
    const b = Fraction.__compareB.copy(this).simplify();

    return (a.numerator === b.numerator) && (a.denominator === b.denominator);
  }

  // Greater than operator.
  greaterThan(compare: Fraction): boolean {
    const a = Fraction.__compareB.copy(this);
    a.subtract(compare);
    return (a.numerator > 0);
  }

  // Greater than or equals operator.
  greaterThanEquals(compare: Fraction): boolean {
    const a = Fraction.__compareB.copy(this);
    a.subtract(compare);
    return (a.numerator >= 0);
  }

  // Less than operator.
  lessThan(compare: Fraction): boolean {
    return !(this.greaterThanEquals(compare));
  }

  // Less than or equals operator.
  lessThanEquals(compare: Fraction): boolean {
    return !(this.greaterThan(compare));
  }

  // Creates a new copy with this current values.
  clone(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }

  // Copies value of another Fraction into itself.
  copy(copy: Fraction|number): this {
    if (typeof copy === 'number') {
      return this.set(copy || 0, 1);
    }
    return this.set(copy.numerator, copy.denominator);
  }

  // Returns the integer component eg. (4/2) == 2
  quotient(): number {
    return Math.floor(this.numerator / this.denominator);
  }

  // Returns the fraction component when reduced to a mixed number
  fraction(): number {
    return this.numerator % this.denominator;
  }

  // Returns the absolute value
  abs(): this {
    this.denominator = Math.abs(this.denominator);
    this.numerator = Math.abs(this.numerator);
    return this;
  }

  // Returns a raw string representation
  toString(): string {
    return this.numerator + '/' + this.denominator;
  }

  // Returns a simplified string respresentation
  toSimplifiedString(): string {
    return Fraction.__tmp.copy(this).simplify().toString();
  }

  // Returns string representation in mixed form
  toMixedString(): string {
    let s = '';
    const q = this.quotient();
    const f = Fraction.__tmp.copy(this);

    if (q < 0) {
      f.abs().fraction();
    } else {
      f.fraction();
    }

    if (q !== 0) {
      s += q;

      if (f.numerator !== 0) {
        s += ' ' + f.toSimplifiedString();
      }
    } else {
      if (f.numerator === 0) {
        s = '0';
      } else {
        s = f.toSimplifiedString();
      }
    }

    return s;
  }

  // Parses a fraction string
  parse(str: string): this {
    const i = str.split('/');
    const n = parseInt(i[0], 10);
    const d = (i[1]) ? parseInt(i[1], 10) : 1;

    return this.set(n, d);
  }
}
