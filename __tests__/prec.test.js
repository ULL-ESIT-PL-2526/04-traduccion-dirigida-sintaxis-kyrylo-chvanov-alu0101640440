const parse = require('../src/parser.js').parse;

describe('Parser Precedence and Associativity Tests', () => {
  describe('Whole number calculations', () => {
    test('should handle multiplication and division before addition and subtraction', () => {
      expect(parse("2 + 3 * 4")).toBe(14); // 2 + (3 * 4) = 14
      expect(parse("10 - 6 / 2")).toBe(7); // 10 - (6 / 2) = 7
      expect(parse("5 * 2 + 3")).toBe(13); // (5 * 2) + 3 = 13
      expect(parse("20 / 4 - 2")).toBe(3); // (20 / 4) - 2 = 3
    });
    test('should handle exponentiation with highest precedence', () => {
      expect(parse("2 + 3 ** 2")).toBe(11); // 2 + (3 ** 2) = 11
      expect(parse("2 * 3 ** 2")).toBe(18); // 2 * (3 ** 2) = 18
      expect(parse("10 - 2 ** 3")).toBe(2); // 10 - (2 ** 3) = 2
    });
    test('should handle right associativity for exponentiation', () => {
      expect(parse("2 ** 3 ** 2")).toBe(512); // 2 ** (3 ** 2) = 2 ** 9 = 512
      expect(parse("3 ** 2 ** 2")).toBe(81); // 3 ** (2 ** 2) = 3 ** 4 = 81
    });
    test('should handle mixed operations with correct precedence', () => {
      expect(parse("1 + 2 * 3 - 4")).toBe(3); // 1 + (2 * 3) - 4 = 3
      expect(parse("15 / 3 + 2 * 4")).toBe(13); // (15 / 3) + (2 * 4) = 13
      expect(parse("10 - 3 * 2 + 1")).toBe(5); // 10 - (3 * 2) + 1 = 5
    });
    test('should handle expressions with exponentiation precedence', () => {
      expect(parse("2 ** 3 + 1")).toBe(9); // (2 ** 3) + 1 = 9
      expect(parse("3 + 2 ** 4")).toBe(19); // 3 + (2 ** 4) = 19
      expect(parse("2 * 3 ** 2 + 1")).toBe(19); // 2 * (3 ** 2) + 1 = 19
    });
    test('should handle various realistic calculations with correct precedence', () => {
      expect(parse("1 + 2 * 3")).toBe(7); // 1 + (2 * 3) = 7
      expect(parse("6 / 2 + 4")).toBe(7); // (6 / 2) + 4 = 7
      expect(parse("2 ** 2 + 1")).toBe(5); // (2 ** 2) + 1 = 5
      expect(parse("10 / 2 / 5")).toBe(1); // (10 / 2) / 5 = 1
      expect(parse("100 - 50 + 25")).toBe(75); // (100 - 50) + 25 = 75
      expect(parse("2 * 3 + 4 * 5")).toBe(26); // (2 * 3) + (4 * 5) = 26
    });
  });
  describe('Floating point calculations', () => {
    test('should handle multiplication and division before addition and subtraction with floats', () => {
      expect(parse("2.35 + 3 * 4")).toBeCloseTo(14.35);           // 2.35 + (3 * 4)
      expect(parse("23 - 6.0 / 2")).toBeCloseTo(20);              // 23 - (6 / 2)
      expect(parse("5.0 * 2.35 + 3")).toBeCloseTo(14.75);         // (5 * 2.35) + 3
      expect(parse("2.35e+3 / 4 - 2")).toBeCloseTo(585.5);        // (2350 / 4) - 2
    });

    test('should handle exponentiation with highest precedence using floats', () => {
      expect(parse("2.35 + 3 ** 2")).toBeCloseTo(11.35);          // 2.35 + (3 ** 2)
      expect(parse("2.0 * 3 ** 2.0")).toBeCloseTo(18);            // 2 * (3 ** 2)
      expect(parse("2E+3 / 2 ** 2")).toBeCloseTo(500);            // (2000) / (2 ** 2)
    });

    test('should handle right associativity for exponentiation with floats', () => {
      expect(parse("2.0 ** 3 ** 2")).toBeCloseTo(512);            // 2 ** (3 ** 2)
      expect(parse("3.5 ** 2 ** 2")).toBeCloseTo(150.0625);       // 3.5 ** (2 ** 2)
    });

    test('should handle mixed operations with correct precedence using floats', () => {
      expect(parse("1 + 2.35e-3 * 1000 - 4")).toBeCloseTo(-0.65); // 1 + (0.00235 * 1000) - 4
      expect(parse("15 / 3 + 2.35E-3 * 1000")).toBeCloseTo(7.35); // (15 / 3) + (0.00235 * 1000)
      expect(parse("10.0 - 3 * 2.35 + 1")).toBeCloseTo(3.95);     // 10 - (3 * 2.35) + 1
    });

    test('should handle various realistic calculations with floats', () => {
      expect(parse("1.0 + 2.35 * 3")).toBeCloseTo(8.05);          // 1 + (2.35 * 3)
      expect(parse("6.0 / 2 + 4.5")).toBeCloseTo(7.5);            // (6 / 2) + 4.5
      expect(parse("2.0 ** 2 + 1.5")).toBeCloseTo(5.5);           // (2 ** 2) + 1.5
      expect(parse("10.0 / 2.0 / 5")).toBeCloseTo(1);             // (10 / 2) / 5
      expect(parse("100.0 - 50.5 + 25")).toBeCloseTo(74.5);       // (100 - 50.5) + 25
      expect(parse("2.35 * 3 + 4 * 5.0")).toBeCloseTo(27.05);     // (2.35 * 3) + (4 * 5)
    });
  });
});