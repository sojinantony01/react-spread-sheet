import { updateFormulaHighlights, clearFormulaHighlights } from "../formula-edit-state";

/**
 * Helpers to create DOM elements that mimic the spreadsheet structure
 * updateFormulaHighlights queries for.
 */
const createCell = (id: string) => {
  const el = document.createElement("input");
  el.id = id;
  document.body.appendChild(el);
  return el;
};

const createTableStructure = (rows: number, cols: number) => {
  const table = document.createElement("table");
  table.className = "sheet-table";

  // thead with th for each column (+1 for the row-axis stub)
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (let c = 0; c <= cols; c++) {
    const th = document.createElement("th");
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // tbody – each tr has a leading <td class="sheet-axis"> plus one td per col
  const tbody = document.createElement("tbody");
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    // axis td (first child)
    const axisTd = document.createElement("td");
    tr.appendChild(axisTd);
    // cell inputs
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
  // Reset DOM between tests
  document.body.innerHTML = "";
});

describe("updateFormulaHighlights", () => {
  test("does nothing when formula does not start with =", () => {
    const cell = createCell("0-0");
    updateFormulaHighlights("SUM(A1)", 1, 1);
    expect(cell.hasAttribute("data-formula-ref")).toBe(false);
  });

  test("clears previous highlights before applying new ones", () => {
    createTableStructure(3, 3);
    // First call — highlight A1 (0-0)
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    const el00 = document.getElementById("0-0");
    expect(el00?.getAttribute("data-formula-ref")).toBe("1");

    // Second call with different formula — previous highlight should be cleared
    updateFormulaHighlights("=B1", 1, 1, undefined, 3, 3);
    expect(el00?.hasAttribute("data-formula-ref")).toBe(false);
    const el01 = document.getElementById("0-1");
    expect(el01?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("highlights a single cell reference", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    const el = document.getElementById("0-0");
    expect(el?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("does not self-highlight the formula cell itself", () => {
    createTableStructure(3, 3);
    // Formula is in B2 (row=1, col=1) and references B2 itself
    updateFormulaHighlights("=B2", 1, 1, undefined, 3, 3);
    const el = document.getElementById("1-1");
    expect(el?.hasAttribute("data-formula-ref")).toBe(false);
  });

  test("highlights a range reference", () => {
    createTableStructure(3, 3);
    // =A1:B2 should highlight (0,0), (0,1), (1,0), (1,1)
    updateFormulaHighlights("=A1:B2", 2, 2, undefined, 3, 3);
    expect(document.getElementById("0-0")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("0-1")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("1-0")?.getAttribute("data-formula-ref")).toBe("1");
    expect(document.getElementById("1-1")?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("highlights column header th for referenced cells", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    // Column 0 → th index 1 (index 0 is the row-axis stub)
    const ths = document.querySelectorAll(".sheet-table thead th");
    expect(ths[1]?.getAttribute("data-formula-col")).toBe("1");
  });

  test("highlights row axis td for referenced cells", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    // Row 0 → first tr in tbody, first td
    const tr = document.querySelector(".sheet-table tbody tr:nth-child(1)");
    const axisTd = tr?.querySelector("td:first-child");
    expect(axisTd?.getAttribute("data-formula-row")).toBe("1");
  });

  test("respects gridRows/gridCols bounds — out-of-bounds refs are ignored", () => {
    createTableStructure(2, 2);
    // C3 is row=2, col=2 which is out of a 2×2 grid
    updateFormulaHighlights("=C3", 0, 0, undefined, 2, 2);
    // No highlights should be set
    expect(document.getElementById("2-2")).toBeNull();
  });

  test("works with custom headerValues", () => {
    createTableStructure(3, 3);
    const headers = ["x", "y", "z"];
    // =y1 references row 0, col 1 with custom headers
    updateFormulaHighlights("=y1", 2, 2, headers, 3, 3);
    expect(document.getElementById("0-1")?.getAttribute("data-formula-ref")).toBe("1");
  });

  test("handles formula with no valid refs gracefully", () => {
    createTableStructure(3, 3);
    // The formula starts with = but contains no cell references
    expect(() => updateFormulaHighlights("=1+2+3", 0, 0, undefined, 3, 3)).not.toThrow();
  });

  test("handles missing DOM elements gracefully", () => {
    // No cells in DOM — should not throw
    expect(() => updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3)).not.toThrow();
  });
});

describe("clearFormulaHighlights", () => {
  test("removes data-formula-ref attributes set by updateFormulaHighlights", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    const el = document.getElementById("0-0");
    expect(el?.hasAttribute("data-formula-ref")).toBe(true);

    clearFormulaHighlights();
    expect(el?.hasAttribute("data-formula-ref")).toBe(false);
  });

  test("removes data-formula-col and data-formula-row attributes", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    clearFormulaHighlights();

    const ths = document.querySelectorAll(".sheet-table thead th");
    ths.forEach((th) => expect(th.hasAttribute("data-formula-col")).toBe(false));

    const trs = document.querySelectorAll(".sheet-table tbody tr");
    trs.forEach((tr) => {
      const axisTd = tr.querySelector("td:first-child");
      expect(axisTd?.hasAttribute("data-formula-row")).toBe(false);
    });
  });

  test("is idempotent — calling twice does not throw", () => {
    createTableStructure(3, 3);
    updateFormulaHighlights("=A1", 1, 1, undefined, 3, 3);
    expect(() => {
      clearFormulaHighlights();
      clearFormulaHighlights();
    }).not.toThrow();
  });
});
