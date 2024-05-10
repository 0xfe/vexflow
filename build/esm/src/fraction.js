import { RuntimeError } from './util.js';
class Fraction {
    static get CATEGORY() {
        return "Fraction";
    }
    static GCD(a, b) {
        if (typeof a !== 'number' || Number.isNaN(a) || typeof b !== 'number' || Number.isNaN(b)) {
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
    static LCM(a, b) {
        return (a * b) / Fraction.GCD(a, b);
    }
    static LCMM(args) {
        if (args.length === 0) {
            return 0;
        }
        else if (args.length === 1) {
            return args[0];
        }
        else if (args.length === 2) {
            return Fraction.LCM(args[0], args[1]);
        }
        else {
            return Fraction.LCM(args.shift(), Fraction.LCMM(args));
        }
    }
    constructor(numerator, denominator) {
        this.numerator = 1;
        this.denominator = 1;
        this.set(numerator, denominator);
    }
    set(numerator = 1, denominator = 1) {
        this.numerator = numerator;
        this.denominator = denominator;
        return this;
    }
    value() {
        return this.numerator / this.denominator;
    }
    simplify() {
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
    add(param1 = 0, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        const lcm = Fraction.LCM(this.denominator, otherDenominator);
        const a = lcm / this.denominator;
        const b = lcm / otherDenominator;
        const u = this.numerator * a + otherNumerator * b;
        return this.set(u, lcm);
    }
    subtract(param1 = 0, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        const lcm = Fraction.LCM(this.denominator, otherDenominator);
        const a = lcm / this.denominator;
        const b = lcm / otherDenominator;
        const u = this.numerator * a - otherNumerator * b;
        return this.set(u, lcm);
    }
    multiply(param1 = 1, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        return this.set(this.numerator * otherNumerator, this.denominator * otherDenominator);
    }
    divide(param1 = 1, param2 = 1) {
        const [otherNumerator, otherDenominator] = getNumeratorAndDenominator(param1, param2);
        return this.set(this.numerator * otherDenominator, this.denominator * otherNumerator);
    }
    equals(compare) {
        const a = Fraction.__staticFractionA.copy(compare).simplify();
        const b = Fraction.__staticFractionB.copy(this).simplify();
        return a.numerator === b.numerator && a.denominator === b.denominator;
    }
    greaterThan(compare) {
        const a = Fraction.__staticFractionB.copy(this);
        a.subtract(compare);
        return a.numerator > 0;
    }
    greaterThanEquals(compare) {
        const a = Fraction.__staticFractionB.copy(this);
        a.subtract(compare);
        return a.numerator >= 0;
    }
    lessThan(compare) {
        return !this.greaterThanEquals(compare);
    }
    lessThanEquals(compare) {
        return !this.greaterThan(compare);
    }
    clone() {
        return new Fraction(this.numerator, this.denominator);
    }
    copy(other) {
        if (typeof other === 'number') {
            return this.set(other, 1);
        }
        else {
            return this.set(other.numerator, other.denominator);
        }
    }
    quotient() {
        return Math.floor(this.numerator / this.denominator);
    }
    remainder() {
        return this.numerator % this.denominator;
    }
    makeAbs() {
        this.denominator = Math.abs(this.denominator);
        this.numerator = Math.abs(this.numerator);
        return this;
    }
    toString() {
        return `${this.numerator}/${this.denominator}`;
    }
    toSimplifiedString() {
        return Fraction.__staticFractionTmp.copy(this).simplify().toString();
    }
    toMixedString() {
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
        }
        else if (f.numerator === 0) {
            s = '0';
        }
        else {
            s = f.toSimplifiedString();
        }
        return s;
    }
    parse(str) {
        const i = str.split('/');
        const n = parseInt(i[0], 10);
        const d = i[1] ? parseInt(i[1], 10) : 1;
        return this.set(n, d);
    }
}
Fraction.__staticFractionA = new Fraction();
Fraction.__staticFractionB = new Fraction();
Fraction.__staticFractionTmp = new Fraction();
export { Fraction };
function getNumeratorAndDenominator(n, d = 1) {
    if (typeof n === 'number') {
        return [n, d];
    }
    else {
        return [n.numerator, n.denominator];
    }
}
