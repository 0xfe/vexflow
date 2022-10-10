/** Fraction represents a rational number. */
export declare class Fraction {
    static get CATEGORY(): string;
    private static __staticFractionA;
    private static __staticFractionB;
    private static __staticFractionTmp;
    /**
     * GCD: Greatest common divisor using the Euclidean algorithm.
     * Note: GCD(0, 0) => 0 and GCD(0, n) => n.
     */
    static GCD(a: number, b: number): number;
    /** LCM: Lowest common multiple. */
    static LCM(a: number, b: number): number;
    /** Lowest common multiple for more than two numbers. */
    static LCMM(args: number[]): number;
    numerator: number;
    denominator: number;
    /** Set the numerator and denominator. */
    constructor(numerator?: number, denominator?: number);
    /** Set the numerator and denominator. */
    set(numerator?: number, denominator?: number): this;
    /** Return the value of the fraction. */
    value(): number;
    /** Simplify numerator and denominator using GCD. */
    simplify(): this;
    /** Add value of another fraction. */
    add(param1?: Fraction | number, param2?: number): this;
    /** Substract value of another fraction. */
    subtract(param1?: Fraction | number, param2?: number): this;
    /** Multiply by value of another fraction. */
    multiply(param1?: Fraction | number, param2?: number): this;
    /** Divide by value of another Fraction. */
    divide(param1?: Fraction | number, param2?: number): this;
    /** Simplify both sides and check if they are equal. */
    equals(compare: Fraction | number): boolean;
    /** Greater than operator. */
    greaterThan(compare: Fraction | number): boolean;
    /** Greater than or equals operator. */
    greaterThanEquals(compare: Fraction | number): boolean;
    /** Less than operator. */
    lessThan(compare: Fraction | number): boolean;
    /** Less than or equals operator. */
    lessThanEquals(compare: Fraction | number): boolean;
    /** Return a new copy with current values. */
    clone(): Fraction;
    /** Copy value of another fraction. */
    copy(other: Fraction | number): this;
    /** Return the integer component (eg. 5/2 => 2). */
    quotient(): number;
    /** Return the remainder component (eg. 5/2 => 1). */
    remainder(): number;
    /** Calculate absolute value. */
    makeAbs(): this;
    /** Return a raw string representation (eg. "5/2"). */
    toString(): string;
    /** Return a simplified string respresentation. */
    toSimplifiedString(): string;
    /** Return string representation in mixed form. */
    toMixedString(): string;
    /** Parse a fraction string. */
    parse(str: string): this;
}
