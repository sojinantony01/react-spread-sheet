import {
  getCalculatedVal,
  getItemsToCopy,
  printToLetter,
  solveMathExpression,
  buildRangeString,
  colIndexToLabel,
  exportToCsv,
  generateDummyContent,
  generateColumns,
} from "../utils";

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

describe("colIndexToLabel", () => {
  it("converts 0-based column index to letter label", () => {
    expect(colIndexToLabel(0)).toBe("A");
    expect(colIndexToLabel(1)).toBe("B");
    expect(colIndexToLabel(25)).toBe("Z");
  });
});

describe("buildRangeString", () => {
  it("returns a single cell label when start and end are the same", () => {
    expect(buildRangeString(0, 0, 0, 0)).toBe("A1");
    expect(buildRangeString(2, 1, 2, 1)).toBe("B3");
  });

  it("returns a range string for a multi-cell selection", () => {
    expect(buildRangeString(0, 0, 2, 1)).toBe("A1:B3");
  });

  it("handles reverse selection (bottom-to-top / right-to-left)", () => {
    expect(buildRangeString(2, 1, 0, 0)).toBe("A1:B3");
  });
});

describe("solveMathExpression", () => {
  test("Basic arithmetic operations", () => {
    expect(solveMathExpression("1+2")).toBe("3");
    expect(solveMathExpression("5-3")).toBe("2");
    expect(solveMathExpression("4*2")).toBe("8");
    expect(solveMathExpression("6/3")).toBe("2");
  });

  test("Operations with decimal numbers", () => {
    expect(solveMathExpression("1.5+2.5")).toBe("4");
    expect(solveMathExpression("5.5-3.5")).toBe("2");
    expect(solveMathExpression("4.5*2.5")).toBe("11.25");
    expect(solveMathExpression("6.5/3.5")).toBe("1.8571428571428572");
  });

  test("Operations with mixed numbers and decimals", () => {
    expect(solveMathExpression("1+2.5")).toBe("3.5");
    expect(solveMathExpression("5.5-3")).toBe("2.5");
    expect(solveMathExpression("4*2.5")).toBe("10");
    expect(solveMathExpression("6/3.5")).toBe("1.7142857142857142");
  });

  test("Operations with negative numbers", () => {
    expect(solveMathExpression("-1+2")).toBe("1");
    expect(solveMathExpression("5-(-3)")).toBe("8");
    expect(solveMathExpression("-4*2")).toBe("-8");
    expect(solveMathExpression("6/-3")).toBe("-2");
  });

  test("Operations with complex expressions", () => {
    expect(solveMathExpression("1+2*3-4/2")).toBe("5");
  });
});

describe("getItemsToCopy", () => {
  it("should return items to copy in correct order", () => {
    expect(
      getItemsToCopy(
        [
          [0, 1],
          [0, 0],
        ],
        [[{ value: "test" }, { value: "test1" }, { value: "sdf" }]],
      ),
    ).toStrictEqual([
      { data: { value: "test1" }, index: [0, 1] },
      { data: { value: "test" }, index: [0, 0] },
    ]);
  });
});

describe("getCalculatedVal", () => {
  it("returns undefined for non-formula values", () => {
    expect(getCalculatedVal("nothing", [[{ value: 1 }]])).toBe(undefined);
  });

  it("evaluates a simple cell-reference formula", () => {
    expect(getCalculatedVal("=A1 + B1", [[{ value: 1 }, { value: 2 }]])).toBe("3");
  });

  it("returns partial result when one reference is out of bounds", () => {
    // AD is not a valid column in a 2-col grid, so it resolves to "0" via safe fallback
    expect(getCalculatedVal("=AD + B1", [[{ value: 1 }, { value: 2 }]])).toBe("2");
  });

  it("returns the raw expression when row is out of bounds", () => {
    // A2 does not exist in a 1-row grid
    const result = getCalculatedVal("=A1 + A2", [[{ value: 1 }, { value: 2 }]]);
    expect(result).toBe("A1 + A2");
  });

  it("evaluates SUM over a range", () => {
    const data = [[{ value: 1 }, { value: 2 }, { value: 3 }]];
    expect(String(getCalculatedVal("=SUM(A1:C1)", data))).toBe("6");
  });

  it("evaluates AVERAGE over a range", () => {
    const data = [[{ value: 2 }, { value: 4 }]];
    expect(String(getCalculatedVal("=AVERAGE(A1:B1)", data))).toBe("3");
  });

  it("evaluates MIN and MAX over a range", () => {
    const data = [[{ value: 5 }, { value: 2 }, { value: 8 }]];
    expect(String(getCalculatedVal("=MIN(A1:C1)", data))).toBe("2");
    expect(String(getCalculatedVal("=MAX(A1:C1)", data))).toBe("8");
  });

  it("evaluates COUNT", () => {
    // COUNT counts all cells in the range (non-numeric values are coerced to 0)
    const data = [[{ value: 1 }, { value: 2 }, { value: 3 }]];
    expect(String(getCalculatedVal("=COUNT(A1:C1)", data))).toBe("3");
  });

  it("evaluates COUNTA (non-empty cells)", () => {
    const data = [[{ value: "a" }, { value: "" }, { value: "c" }]];
    expect(String(getCalculatedVal("=COUNTA(A1:C1)", data))).toBe("2");
  });

  it("evaluates CONCAT", () => {
    const data = [[{ value: "foo" }, { value: "bar" }]];
    expect(getCalculatedVal("=CONCAT(A1:B1)", data)).toBe("foobar");
  });

  it("evaluates ABS", () => {
    const data = [[{ value: -5 }]];
    expect(String(getCalculatedVal("=ABS(A1)", data))).toBe("5");
  });

  it("evaluates SQRT", () => {
    const data = [[{ value: 9 }]];
    expect(String(getCalculatedVal("=SQRT(A1)", data))).toBe("3");
  });

  it("evaluates ROUND", () => {
    const data = [[{ value: 3.14159 }]];
    expect(String(getCalculatedVal("=ROUND(A1,2)", data))).toBe("3.14");
  });

  it("evaluates POWER", () => {
    const data = [[{ value: 2 }]];
    expect(String(getCalculatedVal("=POWER(A1,3)", data))).toBe("8");
  });

  it("evaluates IF with a true condition", () => {
    const data = [[{ value: 10 }, { value: 5 }]];
    expect(getCalculatedVal("=IF(A1>B1,A1,B1)", data)).toBe("10");
  });

  it("evaluates IF with a false condition", () => {
    const data = [[{ value: 3 }, { value: 5 }]];
    expect(getCalculatedVal("=IF(A1>B1,A1,B1)", data)).toBe("5");
  });

  it("evaluates IF with = operator", () => {
    const data = [[{ value: 5 }, { value: 5 }]];
    expect(getCalculatedVal("=IF(A1=B1,1,0)", data)).toBe("1");
  });

  it("evaluates IF with <> operator", () => {
    const data = [[{ value: 5 }, { value: 3 }]];
    expect(getCalculatedVal("=IF(A1<>B1,1,0)", data)).toBe("1");
  });

  it("evaluates IF with <= operator", () => {
    const data = [[{ value: 3 }, { value: 5 }]];
    expect(getCalculatedVal("=IF(A1<=B1,1,0)", data)).toBe("1");
  });

  it("evaluates IF with >= operator", () => {
    const data = [[{ value: 5 }, { value: 3 }]];
    expect(getCalculatedVal("=IF(A1>=B1,1,0)", data)).toBe("1");
  });

  it("evaluates IF with < operator", () => {
    const data = [[{ value: 2 }, { value: 5 }]];
    expect(getCalculatedVal("=IF(A1<B1,1,0)", data)).toBe("1");
  });

  it("returns #NAME? for unknown function", () => {
    const data = [[{ value: 1 }]];
    expect(getCalculatedVal("=UNKNOWNFN(A1)", data)).toBe("#NAME?");
  });

  it("resolves chained formula cells", () => {
    // A1 = "=2+3" (a formula itself), B1 = "=A1*2" → should resolve to 10
    const data = [[{ value: "=2+3" }, { value: "=A1*2" }]];
    expect(getCalculatedVal("=A1*2", data)).toBe("10");
  });

  it("evaluates IF with a non-comparison truthy condition (cell ref)", () => {
    // Exercises the else branch in IF: condition has no comparison operator
    const data = [[{ value: "hello" }, { value: "yes" }, { value: "no" }]];
    expect(getCalculatedVal("=IF(A1,B1,C1)", data)).toBe("yes");
  });

  it("evaluates COUNTA with individual cell args (non-range)", () => {
    // Exercises expandArgsRaw single-arg path (no colon → resolveArg branch)
    const data = [[{ value: "foo" }, { value: "bar" }]];
    expect(getCalculatedVal("=COUNTA(A1,B1)", data)).toBe("2");
  });
});

describe("colIndexToLabel", () => {
  it("converts 0-based column index to letter (default alphabet)", () => {
    expect(colIndexToLabel(0)).toBe("A");
    expect(colIndexToLabel(25)).toBe("Z");
    expect(colIndexToLabel(26)).toBe("AA");
  });

  it("converts 0-based column index to label with custom headerValues", () => {
    expect(colIndexToLabel(0, ["x", "y", "z"])).toBe("x");
    expect(colIndexToLabel(1, ["x", "y", "z"])).toBe("y");
  });
});

describe("buildRangeString", () => {
  it("returns single cell when both corners are the same", () => {
    expect(buildRangeString(0, 0, 0, 0)).toBe("A1");
    expect(buildRangeString(2, 2, 2, 2)).toBe("C3");
  });

  it("builds range with top-left to bottom-right", () => {
    expect(buildRangeString(0, 0, 1, 1)).toBe("A1:B2");
    expect(buildRangeString(0, 0, 2, 2)).toBe("A1:C3");
  });

  it("builds range when coordinates are given in reverse order", () => {
    expect(buildRangeString(2, 2, 0, 0)).toBe("A1:C3");
  });

  it("uses custom headerValues when provided", () => {
    expect(buildRangeString(0, 0, 0, 1, ["x", "y", "z"])).toBe("x1:y1");
  });
});

describe("generateDummyContent", () => {
  it("returns correct dimensions", () => {
    const result = generateDummyContent(3, 4);
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(4);
  });

  it("fills cells with empty value strings", () => {
    const result = generateDummyContent(2, 2);
    expect(result[0][0]).toEqual({ value: "" });
    expect(result[1][1]).toEqual({ value: "" });
  });
});

describe("generateColumns", () => {
  it("returns an array of the requested length filled with empty value objects", () => {
    const cols = generateColumns(5);
    expect(cols).toHaveLength(5);
    cols.forEach((c) => expect(c).toEqual({ value: "" }));
  });
});

describe("exportToCsv", () => {
  beforeAll(() => {
    // jsdom doesn't implement click on anchors; stub it so tests don't throw
    HTMLAnchorElement.prototype.click = vi.fn() as any;
  });

  const makeData = (values: string[][]) => values.map((row) => row.map((v) => ({ value: v })));

  it("triggers a download without headers", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild");
    exportToCsv(
      makeData([
        ["a", "b"],
        ["c", "d"],
      ]),
      "test",
    );
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it("triggers a download with headers included", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild");
    exportToCsv(
      makeData([
        ["a", "b"],
        ["c", "d"],
      ]),
      "test",
      undefined,
      true,
    );
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it("evaluates formula cells during export", () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");
    exportToCsv(makeData([["=A1+1", "2"]]), "formulatest");
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("uses custom headerValues for column headers", () => {
    const appendSpy = vi.spyOn(document.body, "appendChild");
    exportToCsv(makeData([["a"]]), "custom", ["X"], true);
    expect(appendSpy).toHaveBeenCalled();
    appendSpy.mockRestore();
  });
});

describe("getCalculatedVal — extended", () => {
  const data2x2 = (a: string, b: string, c: string, d: string) => [
    [{ value: a }, { value: b }],
    [{ value: c }, { value: d }],
  ];

  it("returns undefined for non-formula values", () => {
    expect(getCalculatedVal("hello", [[{ value: "x" }]])).toBeUndefined();
  });

  it("handles SUM formula over a range", () => {
    const data = data2x2("1", "2", "3", "4");
    // =SUM(A1:B2) = 1+2+3+4 = 10 — returned as string by solveMathExpression
    expect(getCalculatedVal("=SUM(A1:B2)", data)).toBe("10");
  });

  it("handles AVERAGE formula", () => {
    const data = [[{ value: "2" }, { value: "4" }]];
    expect(getCalculatedVal("=AVERAGE(A1:B1)", data)).toBe("3");
  });

  it("handles COUNT formula", () => {
    const data = [[{ value: "1" }, { value: "text" }]];
    expect(getCalculatedVal("=COUNT(A1:B1)", data)).toBe("2");
  });

  it("handles COUNTA formula", () => {
    const data = [[{ value: "1" }, { value: "" }, { value: "x" }]];
    expect(getCalculatedVal("=COUNTA(A1:C1)", data)).toBe("2");
  });

  it("handles MIN formula", () => {
    const data = data2x2("3", "1", "4", "2");
    expect(getCalculatedVal("=MIN(A1:B2)", data)).toBe("1");
  });

  it("handles MAX formula", () => {
    const data = data2x2("3", "1", "4", "2");
    expect(getCalculatedVal("=MAX(A1:B2)", data)).toBe("4");
  });

  it("handles CONCAT formula", () => {
    const data = [[{ value: "hello" }, { value: " world" }]];
    expect(getCalculatedVal("=CONCAT(A1:B1)", data)).toBe("hello world");
  });

  it("handles IF formula — true branch", () => {
    const data = [[{ value: "5" }, { value: "3" }]];
    expect(getCalculatedVal("=IF(A1>B1,A1,B1)", data)).toBe("5");
  });

  it("handles IF formula — false branch", () => {
    const data = [[{ value: "2" }, { value: "8" }]];
    expect(getCalculatedVal("=IF(A1>B1,A1,B1)", data)).toBe("8");
  });

  it("handles IF formula — <= operator", () => {
    const data = [[{ value: "3" }, { value: "3" }]];
    expect(getCalculatedVal("=IF(A1<=B1,1,0)", data)).toBe("1");
  });

  it("handles IF formula — <> operator", () => {
    const data = [[{ value: "3" }, { value: "4" }]];
    expect(getCalculatedVal("=IF(A1<>B1,1,0)", data)).toBe("1");
  });

  it("handles IF formula — = operator", () => {
    const data = [[{ value: "3" }, { value: "3" }]];
    expect(getCalculatedVal("=IF(A1=B1,1,0)", data)).toBe("1");
  });

  it("handles IF formula — < operator", () => {
    const data = [[{ value: "2" }, { value: "5" }]];
    expect(getCalculatedVal("=IF(A1<B1,yes,no)", data)).toBe("yes");
  });

  it("handles IF formula — >= operator", () => {
    const data = [[{ value: "5" }, { value: "3" }]];
    expect(getCalculatedVal("=IF(A1>=B1,big,small)", data)).toBe("big");
  });

  it("handles IF without third argument", () => {
    const data = [[{ value: "0" }]];
    expect(getCalculatedVal("=IF(A1>1,yes)", data)).toBe("");
  });

  it("handles IF with non-comparison condition (truthy)", () => {
    const data = [[{ value: "1" }]];
    expect(getCalculatedVal("=IF(A1,yes,no)", data)).toBe("yes");
  });

  it("handles IF with non-comparison condition (falsy 0)", () => {
    const data = [[{ value: "0" }]];
    expect(getCalculatedVal("=IF(A1,yes,no)", data)).toBe("no");
  });

  it("handles ROUND formula", () => {
    const data = [[{ value: "3.14159" }]];
    expect(getCalculatedVal("=ROUND(A1,2)", data)).toBe("3.14");
  });

  it("handles ABS formula", () => {
    const data = [[{ value: "-5" }]];
    expect(getCalculatedVal("=ABS(A1)", data)).toBe("5");
  });

  it("handles SQRT formula", () => {
    const data = [[{ value: "9" }]];
    expect(getCalculatedVal("=SQRT(A1)", data)).toBe("3");
  });

  it("handles POWER formula", () => {
    const data = [[{ value: "2" }]];
    expect(getCalculatedVal("=POWER(A1,3)", data)).toBe("8");
  });

  it("returns #NAME? for unknown function", () => {
    const data = [[{ value: "1" }]];
    expect(getCalculatedVal("=UNKNOWN(A1)", data)).toBe("#NAME?");
  });

  it("handles chained cell references (cell formula referencing another formula cell)", () => {
    // A1=5, B1 = =A1*2 = 10, C1 = =B1+1 → 11 — returned as string
    const data = [[{ value: "5" }, { value: "=A1*2" }, { value: "=B1+1" }]];
    expect(getCalculatedVal("=B1+1", data)).toBe("11");
  });

  it("handles SUM with mixed range and individual cell args", () => {
    const data = [[{ value: "1" }, { value: "2" }, { value: "3" }]];
    expect(getCalculatedVal("=SUM(A1:B1,C1)", data)).toBe("6");
  });

  it("handles AVERAGE with empty range", () => {
    // expandArgsNumeric returns [] for out-of-bounds range → average should be 0
    expect(getCalculatedVal("=AVERAGE(Z99:Z100)", [[{ value: "1" }]])).toBe("0");
  });

  it("handles MIN with no values → 0", () => {
    expect(getCalculatedVal("=MIN(Z99:Z100)", [[{ value: "1" }]])).toBe("0");
  });

  it("handles MAX with no values → 0", () => {
    expect(getCalculatedVal("=MAX(Z99:Z100)", [[{ value: "1" }]])).toBe("0");
  });

  it("handles COUNT with no values → 0", () => {
    expect(getCalculatedVal("=COUNT(Z99:Z100)", [[{ value: "1" }]])).toBe("0");
  });

  it("handles IF with fewer than 2 args → empty string", () => {
    expect(getCalculatedVal("=IF(A1)", [[{ value: "1" }]])).toBe("");
  });

  it("handles string literal in formula (quoted)", () => {
    expect(getCalculatedVal('=IF(1>0,"yes","no")', [[{ value: "" }]])).toBe("yes");
  });

  it("handles cell ref that is out of bounds (throws inside getCalculatedVal → returns expr)", () => {
    const data = [[{ value: "1" }]];
    // Z99 is out of bounds → resolveCellRef throws, caught, returns the mangled expr
    const result = getCalculatedVal("=Z99", data);
    // Either the result is the fallback val string or the error string — it must not throw
    expect(result).toBeDefined();
  });

  it("handles expression with no digits after resolving (text path)", () => {
    const data = [[{ value: "hello" }]];
    // A1 resolves to "hello", no digits → returns "hello"
    expect(getCalculatedVal("=A1", data)).toBe("hello");
  });
});
