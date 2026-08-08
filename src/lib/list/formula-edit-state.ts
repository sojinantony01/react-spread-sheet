/**
 * Formula reference highlights.
 *
 * Manages DOM-level highlights for cells/ranges referenced in the formula
 * being edited. Applied directly via setAttribute to avoid React re-renders.
 */

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const colLabelToIndex = (label: string, headerValues?: string[]): number => {
  const values = headerValues && headerValues.length ? headerValues : alphabet;
  if (typeof values === "string") {
    let n = 0;
    for (const ch of label.toUpperCase()) {
      n = n * 26 + (alphabet.indexOf(ch) + 1);
    }
    return n - 1;
  }
  return (values as string[]).indexOf(label);
};

const extractRefs = (
  formula: string,
  headerValues?: string[],
  gridRows = 0,
  gridCols = 0,
): Array<[number, number]> => {
  const cells: Array<[number, number]> = [];
  const rangeRe = /([A-Z]+)(\d+):([A-Z]+)(\d+)/gi;
  const cellRe = /\b([A-Z]+)(\d+)\b/gi;
  const rangeMatches: Array<{ start: number; end: number }> = [];
  let m: RegExpExecArray | null;

  rangeRe.lastIndex = 0;
  while ((m = rangeRe.exec(formula)) !== null) {
    rangeMatches.push({ start: m.index, end: m.index + m[0].length });
    const c1 = colLabelToIndex(m[1], headerValues);
    const r1 = parseInt(m[2], 10) - 1;
    const c2 = colLabelToIndex(m[3], headerValues);
    const r2 = parseInt(m[4], 10) - 1;
    const rMin = Math.min(r1, r2);
    const rMax = Math.max(r1, r2);
    const cMin = Math.min(c1, c2);
    const cMax = Math.max(c1, c2);
    for (let r = rMin; r <= rMax; r++)
      for (let c = cMin; c <= cMax; c++)
        if (gridRows === 0 || (r < gridRows && c < gridCols)) cells.push([r, c]);
  }

  cellRe.lastIndex = 0;
  while ((m = cellRe.exec(formula)) !== null) {
    if (!rangeMatches.some((rng) => m!.index >= rng.start && m!.index < rng.end)) {
      const c = colLabelToIndex(m[1], headerValues);
      const r = parseInt(m[2], 10) - 1;
      if (gridRows === 0 || (r < gridRows && c < gridCols)) cells.push([r, c]);
    }
  }
  return cells;
};

let _highlightedIds: string[] = [];
let _highlightedAxes: { el: Element; attr: string }[] = [];

/**
 * Parse the formula and set `data-formula-ref` on referenced cell DOM elements.
 * Also highlights column <th> and row axis <td> headers.
 * Pure DOM — zero React re-renders.
 */
export const updateFormulaHighlights = (
  formulaValue: string,
  formulaRow: number,
  formulaCol: number,
  headerValues?: string[],
  gridRows = 0,
  gridCols = 0,
): void => {
  for (const id of _highlightedIds) {
    const el = document.getElementById(id);
    if (el) {
      el.removeAttribute("data-formula-ref");
    }
  }
  _highlightedIds = [];
  for (const { el, attr } of _highlightedAxes) el.removeAttribute(attr);
  _highlightedAxes = [];

  if (!formulaValue.startsWith("=")) return;

  const refs = extractRefs(formulaValue.slice(1), headerValues, gridRows, gridCols);
  const highlightedCols = new Set<number>();
  const highlightedRows = new Set<number>();

  for (const [r, c] of refs) {
    if (r === formulaRow && c === formulaCol) continue;
    const el = document.getElementById(`${r}-${c}`);
    if (el) {
      el.setAttribute("data-formula-ref", "1");
      _highlightedIds.push(`${r}-${c}`);
    }
    highlightedCols.add(c);
    highlightedRows.add(r);
  }

  const headerThs = document.querySelectorAll(".sheet-table thead th");
  for (const col of highlightedCols) {
    const th = headerThs[col + 1] as HTMLElement | undefined;
    if (th) {
      th.setAttribute("data-formula-col", "1");
      _highlightedAxes.push({ el: th, attr: "data-formula-col" });
    }
  }
  for (const row of highlightedRows) {
    const tr = document.querySelector(`.sheet-table tbody tr:nth-child(${row + 1})`);
    const axisTd = tr?.querySelector("td:first-child");
    if (axisTd) {
      axisTd.setAttribute("data-formula-row", "1");
      _highlightedAxes.push({ el: axisTd, attr: "data-formula-row" });
    }
  }
};

export const clearFormulaHighlights = (): void => {
  for (const id of _highlightedIds) {
    document.getElementById(id)?.removeAttribute("data-formula-ref");
  }
  _highlightedIds = [];
  for (const { el, attr } of _highlightedAxes) el.removeAttribute(attr);
  _highlightedAxes = [];
};
