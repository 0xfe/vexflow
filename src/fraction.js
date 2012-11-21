// Fraction class that represents a rational number
// @author zz85
// @author incompleteopus (modifications)

Vex.Flow.Fraction = function(numerator, denominator) {
  this.set(numerator, denominator);
}

Vex.Flow.Fraction.prototype.constructor = Vex.Flow.Fraction;

Vex.Flow.Fraction.prototype.set = function(numerator, denominator) {
  this.numerator = numerator === undefined ? 1 : numerator;
  this.denominator = denominator === undefined ? 1 : denominator;
  return this;
}

Vex.Flow.Fraction.prototype.value = function() {
  return this.numerator / this.denominator;
}

Vex.Flow.Fraction.prototype.simplify = function() {
  var u = this.numerator;
  var d = this.denominator;

  var gcd = Vex.Flow.Fraction.GCD(u, d);
  u /= gcd;
  d /= gcd;

  if (d < 0) {
    d = -d;
    u = -u;
  }
  return this.set(u, d);
}

Vex.Flow.Fraction.prototype.add = function(param1, param2) {
  var otherNumerator;
  var otherDenominator;

  if (param1 instanceof Vex.Flow.Fraction) {
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

  var lcm = Vex.Flow.Fraction.LCM(this.denominator, otherDenominator);
  var a = lcm / this.denominator;
  var b = lcm / otherDenominator;

  var u = this.numerator * a + otherNumerator * b;
  return this.set(u, lcm);
}

Vex.Flow.Fraction.prototype.subtract = function(param1, param2) {
  var otherNumerator;
  var otherDenominator;

  if (param1 instanceof Vex.Flow.Fraction) {
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

  var lcm = Vex.Flow.Fraction.LCM(this.denominator, otherDenominator);
  var a = lcm / this.denominator;
  var b = lcm / otherDenominator;

  var u = this.numerator * a - otherNumerator * b;
  return this.set(u, lcm);
}

Vex.Flow.Fraction.prototype.multiply = function(param1, param2) {
  var otherNumerator;
  var otherDenominator;

  if (param1 instanceof Vex.Flow.Fraction) {
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

Vex.Flow.Fraction.prototype.divide = function(param1, param2) {
  var otherNumerator;
  var otherDenominator;

  if (param1 instanceof Vex.Flow.Fraction) {
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

// Temporary cached objects
Vex.Flow.Fraction.__compareA = new Vex.Flow.Fraction();
Vex.Flow.Fraction.__compareB = new Vex.Flow.Fraction();
Vex.Flow.Fraction.__tmp = new Vex.Flow.Fraction();

// Simplifies both sides and checks if they are equal
Vex.Flow.Fraction.prototype.equals = function(compare) {
  var a = Vex.Flow.Fraction.__compareA.copy(compare).simplify();
  var b = Vex.Flow.Fraction.__compareB.copy(this).simplify();

  return (a.numerator === b.numerator) && (a.denominator === b.denominator);
}

// Creates a new copy with this current values
Vex.Flow.Fraction.prototype.clone = function() {
  return new Vex.Flow.Fraction(this.numerator, this.denominator);
}

// Copies value of another Fraction into itself
Vex.Flow.Fraction.prototype.copy = function(copy) {
  return this.set(copy.numerator, copy.denominator);
}

// Returns the integer component eg. (4/2) == 2
Vex.Flow.Fraction.prototype.quotient = function() {
  return Math.floor(this.numerator / this.denominator);
}

// Returns the fraction component when reduced to a mixed number
Vex.Flow.Fraction.prototype.fraction = function() {
  return this.numerator % this.denominator;
}

// Returns the absolute value
Vex.Flow.Fraction.prototype.abs = function() {
  this.denominator = Math.abs(this.denominator);
  this.numerator = Math.abs(this.numerator);
  return this;
}

// Returns a raw string representation
Vex.Flow.Fraction.prototype.toString = function() {
  return this.numerator + '/' + this.denominator;
}

// Returns a simplified string respresentation
Vex.Flow.Fraction.prototype.toSimplifiedString = function() {
  return Vex.Flow.Fraction.__tmp.copy(this).simplify().toString();
}

// Returns string representation in mixed form
Vex.Flow.Fraction.prototype.toMixedString = function() {
  var s = '';
  var q = this.quotient();
  var f = Vex.Flow.Fraction.__tmp.copy(this);

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
Vex.Flow.Fraction.prototype.parse = function(str) {
  var i = str.split('/');
  var n = parseInt(i[0], 0);
  var d = (i[1]) ? parseInt(i[1], 0) : 1;

  return this.set(n, d);
}

/**
 * GCD: Find greatest common divisor using Euclidean algorithm
 */
Vex.Flow.Fraction.GCD = function(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Vex.RERR("BadArgument", "Invalid numbers: " + a + ", " + b);
  }

  var t;

  while (b != 0) {
    t = b;
    b = a % b;
    a = t;
  }

  return a;
}

/**
 * LCM: Lowest common multiple
 */
Vex.Flow.Fraction.LCM = function(a, b) {
  return ((a * b) / Vex.Flow.Fraction.GCD(a, b));
}

/**
 * LCMM: Lowest common multiple for more than two numbers
 */
Vex.Flow.Fraction.LCMM = function(args) {
  if (args.length == 0) {
    return 0;
  } else if (args.length == 1) {
    return args[0];
  } else if (args.length == 2) {
    return Vex.Flow.Fraction.LCM(args[0], args[1]);
  } else {
    var arg0 = args[0];
    args.shift();
    return Vex.Flow.Fraction.LCM(arg0, Vex.Flow.Fraction.LCMM(args));
  }
}

