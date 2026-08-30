import { updateFormulaHighlights, clearFormulaHighlights } from "../formula-edit-state";

/**
 * formula-edit-state tests
 *
 * These tests verify real observable DOM behaviour:
 * - cells referenced in a formula get data-formula-ref set
 * - column headers get data-formula-col set
 * - row axis headers get data-formula-row set
 * - switching to a new formula clears the previous highlights
 * - clearFormulaHighlights removes all attributes
 * - non-formula values produce no highlights
 */

const makeCell = (id: string): HTMLInputElement => {
  const el = document.createElement("input");
  el.id = id;
  document.body.appendChild(el);
  return el;
};

const makeTh = (): HTMLTableCellElement => {
  const el = document.createElement("th");
  return el;
};

const makeTable = (rows: number, cols: number) => {
  const table = document.createElement("table");
  table.className = "sheet-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  // First th is the row-axis header (blank); subsequent ths are column headers
  for (let c = 0; c <= cols; c++) {
    headerRow.appendChild(makeTh());
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    // First td is the row axis
    const axisTd = document.createElement("td");
    tr.appendChild(axisTd);
    for (let c = 0; c < cols; c++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.id = `${r}-${c}`;
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  document.body.appendChild(table);
  return table;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("updateFormulaHighlights", () => {
  test("non-formula value produces no highlights", () => {
    makeCell("0-0");
    updateFormulaHighlights("hello", 1, 1);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBeNull();
  });

  test("formula with a single cell ref highlights that cell", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    const el = document.getElementById("0-0");
    expect(el?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("formula does not highlight the cell being edited", () => {
    makeTable(3, 3);
    // editing B2 (row=1,col=1), formula references B2 itself
    updateFormulaHighlights("=B2", 1, 1, undefined, 3, 3);
    expect(document.getElementById("1-1")?.getAttribute("data-formula-ref")).toBeNull();
  });

  test("range formula highlights all cells in range", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=SUM(A1:B2)", 2, 2, undefined, 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("0-1")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("1-0")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("1-1")?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("column headers get data-formula-col when a column is referenced", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 2, 2, undefined, 3, 3);
    // Column A is index 0; in the header row, col 0 maps to th[1] (th[0] is the blank corner)
    const headerThs = document.querySelectorAll(".sheet-table thead th");
    expect(headerThs[1]?.getAttribute("data-formula-col")).toBe("1");
  });

  test("row axis td gets data-formula-row when a row is referenced", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 2, 2, undefined, 3, 3);
    // Row 0 axis td is the first td in the first tbody tr
    const firstRowAxisTd = document.querySelector(".sheet-table tbody tr:nth-child(1) td:first-child");
    expect(firstRowAxisTd?.getAttribute("data-formula-row")).toBe("1");
  });

  test("calling again clears previous highlights and applies new ones", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 2, 2, undefined, 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBe("1");

    // Now update to reference B1 instead
    updateFormulaHighlights("=B1", 2, 2, undefined, 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBeNull();
    expect(document.getElementById("0-1")?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("out-of-bounds cell refs are ignored when gridRows/gridCols are provided", () => {
    makeTable(2, 2);
    // Z99 is far outside a 2x2 grid
    updateFormulaHighlights("=Z99", 0, 0, undefined, 2, 2);
    // no ref should be set on any cell
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBeNull();
  });
});

describe("updateFormulaHighlights — custom headerValues", () => {
  test("uses custom header array to resolve column references", () => {
    makeTable(3, 3);
    // With headerValues=["X","Y","Z"], "X" maps to col 0, "Y" to col 1
    updateFormulaHighlights("=X1", 2, 2, ["X", "Y", "Z"], 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBe("1");
  });
});

describe("clearFormulaHighlights", () => {
  test("removes data-formula-ref from highlighted cells", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 2, 2, undefined, 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBe("1");

    clearFormulaHighlights();
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBeNull();
  });

  test("removes data-formula-col and data-formula-row from axis headers", () => {
    makeTable(3, 3);
    updateFormulaHighlights("=A1", 2, 2, undefined, 3, 3);

    clearFormulaHighlights();

    const headerThs = document.querySelectorAll(".sheet-table thead th");
    expect(headerThs[1]?.getAttribute("data-formula-col")).toBeNull();

    const firstRowAxisTd = document.querySelector(".sheet-table tbody tr:nth-child(1) td:first-child");
    expect(firstRowAxisTd?.getAttribute("data-formula-row")).toBeNull();
  });

  test("calling clearFormulaHighlights when nothing is highlighted is a no-op", () => {
    expect(() => clearFormulaHighlights()).not.toThrow();
  });
});
