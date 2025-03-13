import { printToLetter, solveMathExpression } from "../utils"
describe("printToLetter", () => {
  it("should convert a number to letters using the default alphabet", () => {
    expect(printToLetter(1)).toEqual("A");
    expect(printToLetter(26)).toEqual("Z");
    expect(printToLetter(27)).toEqual("AA");
    expect(printToLetter(52)).toEqual("AZ");
    expect(printToLetter(53)).toEqual("BA");
  });

  it("should convert a number to letters using a custom alphabet", () => {
    expect(printToLetter(1, ["a", "b", "c"])).toEqual("a");
    expect(printToLetter(2, ["a", "b", "c"])).toEqual("b");
    expect(printToLetter(3, ["a", "b", "c"])).toEqual("c");
    expect(printToLetter(4, ["a", "b", "c"])).toEqual("aa");
    expect(printToLetter(6, ["a", "b", "c"])).toEqual("ac");
  });
});

describe("solveMathExpression", () => {
  // Test 1: Basic arithmetic operations
  test("Basic arithmetic operations", () => {
    expect(solveMathExpression("1+2")).toBe("3");
    expect(solveMathExpression("5-3")).toBe("2");
    expect(solveMathExpression("4*2")).toBe("8");
    expect(solveMathExpression("6/3")).toBe("2");
  });


  // Test 3: Operations with decimal numbers
  test("Operations with decimal numbers", () => {
    expect(solveMathExpression("1.5+2.5")).toBe("4");
    expect(solveMathExpression("5.5-3.5")).toBe("2");
    expect(solveMathExpression("4.5*2.5")).toBe("11.25");
    expect(solveMathExpression("6.5/3.5")).toBe("1.8571428571428572");
  });

  // Test 4: Operations with mixed numbers and decimals
  test("Operations with mixed numbers and decimals", () => {
    expect(solveMathExpression("1+2.5")).toBe("3.5");
    expect(solveMathExpression("5.5-3")).toBe("2.5");
    expect(solveMathExpression("4*2.5")).toBe("10");
    expect(solveMathExpression("6/3.5")).toBe("1.7142857142857142");
  });

  // Test 5: Operations with negative numbers
  test("Operations with negative numbers", () => {
    expect(solveMathExpression("-1+2")).toBe("1");
    expect(solveMathExpression("5-(-3)")).toBe("8");
    expect(solveMathExpression("-4*2")).toBe("-8");
    expect(solveMathExpression("6/-3")).toBe("-2");
  });

  // Test 6: Operations with complex expressions
  test("Operations with complex expressions", () => {
    expect(solveMathExpression("1+2*3-4/2")).toBe("5");
  });
})

