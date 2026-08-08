import { Data, Selected } from "../reducer";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Convert a 0-based column index to an Excel-style letter label (0→A, 1→B, 26→AA …)
export const colIndexToLabel = (colIdx: number, headerValues?: string[]): string => {
  return printToLetter(colIdx + 1, headerValues);
};

// Build a range string like "A1:C3" from two [row,col] pairs (0-based).
export const buildRangeString = (
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  headerValues?: string[],
): string => {
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  const startCol = colIndexToLabel(minC, headerValues);
  const endCol = colIndexToLabel(maxC, headerValues);
  if (minR === maxR && minC === maxC) return `${startCol}${minR + 1}`;
  return `${startCol}${minR + 1}:${endCol}${maxR + 1}`;
};

export const printToLetter = (num: number, headerValues?: string[]): string => {
  let result = "";
  const values = headerValues && headerValues.length ? headerValues : alphabet;
  let charIndex = num % values.length;
  let quotient = num / values.length;
  if (charIndex - 1 === -1) {
    charIndex = values.length;
    quotient--;
  }
  result = values[charIndex - 1] + result;
  if (quotient >= 1) {
    return printToLetter(parseInt(quotient.toFixed(0)), headerValues) + result;
  }
  return result;
};

export const exportToCsv = (
  results: any[][],
  fileName: string,
  headerValues?: string[],
  includeHeaders: boolean = false,
) => {
  const header = results[0].map((d, i) => printToLetter(i + 1, headerValues));
  var CsvString = "";
  if (includeHeaders) {
    CsvString += " ,";
    header.forEach((head) => {
      CsvString += head + ",";
    });
    CsvString += "\r\n";
  }

  results.forEach((rowItem, RowIndex) => {
    if (includeHeaders) CsvString += RowIndex + ",";
    rowItem.forEach((colVal, ColIndex) => {
      let val = colVal.value;
      if (val && val.toString().trim().startsWith("=")) {
        CsvString += getCalculatedVal(val, results, headerValues) + ",";
      } else {
        CsvString += val + ",";
      }
    });
    CsvString += "\r\n";
  });
  CsvString = "data:application/csv," + encodeURIComponent(CsvString);
  var x = document.createElement("A");
  x.setAttribute("href", CsvString);
  x.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(x);
  x.click();
};

// Resolve a cell reference like "A1" — throws if out of bounds so the caller's try/catch can fall back.
const resolveCellRef = (ref: string, data: any[][], headerValues?: string[]): string => {
  const match = /^([A-Z]+)([0-9]+)$/i.exec(ref.trim());
  if (!match) throw new Error(`#REF: ${ref}`);
  const colLabel = match[1].toUpperCase();
  const rowNum = parseInt(match[2], 10);
  const values = headerValues || alphabet;
  const colIdx = values.indexOf(colLabel);
  if (colIdx === -1 || rowNum < 1 || rowNum > data.length) throw new Error(`#REF: ${ref}`);
  const row = data[rowNum - 1];
  if (!row || colIdx >= row.length) throw new Error(`#REF: ${ref}`);
  return String(row[colIdx]?.value ?? "");
};

// Safe version of resolveCellRef — returns "0" for out-of-bounds cells (used inside SUM/AVERAGE etc).
const resolveCellRefSafe = (ref: string, data: any[][], headerValues?: string[]): string => {
  try {
    return resolveCellRef(ref, data, headerValues);
  } catch {
    return "0";
  }
};

// Expand a range like "A1:C3" into an array of numeric values.
const expandRange = (range: string, data: any[][], headerValues?: string[]): number[] => {
  const parts = range.split(":");
  if (parts.length !== 2) return [];
  const startMatch = /^([A-Z]+)([0-9]+)$/i.exec(parts[0].trim());
  const endMatch = /^([A-Z]+)([0-9]+)$/i.exec(parts[1].trim());
  if (!startMatch || !endMatch) return [];
  const values = headerValues || alphabet;
  const c1 = values.indexOf(startMatch[1].toUpperCase());
  const r1 = parseInt(startMatch[2], 10) - 1;
  const c2 = values.indexOf(endMatch[1].toUpperCase());
  const r2 = parseInt(endMatch[2], 10) - 1;
  if (c1 === -1 || c2 === -1) return [];
  const result: number[] = [];
  const rMin = Math.min(r1, r2);
  const rMax = Math.max(r1, r2);
  const cMin = Math.min(c1, c2);
  const cMax = Math.max(c1, c2);
  for (let r = rMin; r <= rMax && r < data.length; r++) {
    for (let c = cMin; c <= cMax && c < (data[r]?.length ?? 0); c++) {
      const n = parseFloat(data[r][c]?.value);
      result.push(isNaN(n) ? 0 : n);
    }
  }
  return result;
};

// Expand a range into raw string values (for COUNTA, CONCAT).
const expandRangeRaw = (range: string, data: any[][], headerValues?: string[]): string[] => {
  const parts = range.split(":");
  if (parts.length !== 2) return [];
  const startMatch = /^([A-Z]+)([0-9]+)$/i.exec(parts[0].trim());
  const endMatch = /^([A-Z]+)([0-9]+)$/i.exec(parts[1].trim());
  if (!startMatch || !endMatch) return [];
  const values = headerValues || alphabet;
  const c1 = values.indexOf(startMatch[1].toUpperCase());
  const r1 = parseInt(startMatch[2], 10) - 1;
  const c2 = values.indexOf(endMatch[1].toUpperCase());
  const r2 = parseInt(endMatch[2], 10) - 1;
  if (c1 === -1 || c2 === -1) return [];
  const result: string[] = [];
  const rMin = Math.min(r1, r2);
  const rMax = Math.max(r1, r2);
  const cMin = Math.min(c1, c2);
  const cMax = Math.max(c1, c2);
  for (let r = rMin; r <= rMax && r < data.length; r++) {
    for (let c = cMin; c <= cMax; c++) {
      result.push(String(data[r][c]?.value ?? ""));
    }
  }
  return result;
};

// Parse comma-separated arguments (respecting nested parens) for multi-arg functions like IF.
const parseArgs = (argsStr: string): string[] => {
  const args: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of argsStr) {
    if (ch === "(") {
      depth++;
      current += ch;
    } else if (ch === ")") {
      depth--;
      current += ch;
    } else if (ch === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
};

// Evaluate a function call like SUM(A1:A5) or IF(A1>B1,A1,B1).
const evalFunction = (
  name: string,
  argsStr: string,
  data: any[][],
  headerValues?: string[],
): string | number => {
  const fn = name.toUpperCase();
  switch (fn) {
    case "SUM": {
      const nums = argsStr.includes(":")
        ? expandRange(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => parseFloat(resolveArg(a, data, headerValues)) || 0);
      return nums.reduce((s, n) => s + n, 0);
    }
    case "AVERAGE": {
      const nums = argsStr.includes(":")
        ? expandRange(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => parseFloat(resolveArg(a, data, headerValues)) || 0);
      return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
    }
    case "COUNT": {
      const nums = argsStr.includes(":")
        ? expandRange(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => parseFloat(resolveArg(a, data, headerValues)));
      return nums.filter((n) => !isNaN(n)).length;
    }
    case "COUNTA": {
      const raws = argsStr.includes(":")
        ? expandRangeRaw(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => resolveArg(a, data, headerValues));
      return raws.filter((v) => v !== "" && v !== undefined).length;
    }
    case "MIN": {
      const nums = argsStr.includes(":")
        ? expandRange(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => parseFloat(resolveArg(a, data, headerValues)) || 0);
      return nums.length ? Math.min(...nums) : 0;
    }
    case "MAX": {
      const nums = argsStr.includes(":")
        ? expandRange(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => parseFloat(resolveArg(a, data, headerValues)) || 0);
      return nums.length ? Math.max(...nums) : 0;
    }
    case "CONCAT": {
      const raws = argsStr.includes(":")
        ? expandRangeRaw(argsStr, data, headerValues)
        : parseArgs(argsStr).map((a) => resolveArg(a, data, headerValues));
      return raws.join("");
    }
    case "IF": {
      const args = parseArgs(argsStr);
      if (args.length < 2) return "";
      const condition = resolveArg(args[0], data, headerValues);
      const truthy = condition && condition !== "0" && condition !== "false" && condition !== "";
      const branch = truthy ? args[1] : (args[2] ?? "");
      return resolveArg(branch, data, headerValues);
    }
    case "ROUND": {
      const args = parseArgs(argsStr);
      const num = parseFloat(resolveArg(args[0] || "0", data, headerValues)) || 0;
      const digits = parseInt(resolveArg(args[1] || "0", data, headerValues)) || 0;
      return parseFloat(num.toFixed(digits));
    }
    case "ABS": {
      return Math.abs(parseFloat(resolveArg(argsStr.trim(), data, headerValues)) || 0);
    }
    case "SQRT": {
      return Math.sqrt(parseFloat(resolveArg(argsStr.trim(), data, headerValues)) || 0);
    }
    case "POWER": {
      const args = parseArgs(argsStr);
      const base = parseFloat(resolveArg(args[0] || "0", data, headerValues)) || 0;
      const exp = parseFloat(resolveArg(args[1] || "1", data, headerValues)) || 1;
      return Math.pow(base, exp);
    }
    default:
      return `#NAME?`;
  }
};

// Resolve a single argument — could be a cell ref, a number literal, or a string literal.
// Uses safe fallback so out-of-bounds refs return "0" rather than throwing.
const resolveArg = (arg: string, data: any[][], headerValues?: string[]): string => {
  arg = arg.trim();
  if (/^[A-Z]+[0-9]+$/i.test(arg)) {
    return resolveCellRefSafe(arg, data, headerValues);
  }
  if (/^".*"$/.test(arg)) return arg.slice(1, -1);
  return arg;
};

export const getCalculatedVal = (
  val: string,
  data: any[][],
  headerValues?: string[],
): string | number => {
  try {
    val = val.toString().trim();
    val = val.substring(1, val.length); // strip leading "="

    // Evaluate named functions: SUM(...), IF(...), etc.
    // Process innermost function calls first (no nested parens in args), then repeat.
    let iterations = 0;
    while (/[A-Z]+\s*\(/i.test(val) && iterations++ < 20) {
      val = val.replace(/([A-Z]+)\s*\(([^()]*)\)/gi, (_, name, args) => {
        const result = evalFunction(name, args, data, headerValues);
        return String(result);
      });
    }

    // Replace remaining standalone cell references (e.g. A1, B2).
    // Uses throwing resolveCellRef so out-of-bounds refs propagate to the catch block.
    val = val.replace(/\b([A-Z]+)([0-9]+)\b/gi, (x) => {
      return resolveCellRef(x, data, headerValues); // throws on out-of-bounds → caught below
    });

    val = val.replaceAll(/\(.+?\)/gi, solveMathExpression);
    return solveMathExpression(val);
  } catch (e) {
    return val;
  }
};
interface Calcs {
  [key: string]: (a: number, b: number) => string;
}
export const solveMathExpression = (expr: string) => {
  let str = expr.replace(/ +/g, "");

  const m = [...str.matchAll(/(-?[\d.]+)([*\/+-])?/g)].flat().filter((x, i) => x && i % 3);

  const calc: Calcs = {
    "*": (a: number, b: number) => (a * b).toString(),
    "/": (a: number, b: number) => (a / b).toString(),
    "+": (a: any, b: any) => (a + b).toString(),
    "-": (a: number, b: number) => (a - b).toString(),
  };

  [/[*\/]/, /[+-]/].forEach((expr) => {
    for (let i = 0; i < m.length; i += 2) {
      let [a, x1, b] = [m[i], m[i + 1], m[i + 2]];

      let x: RegExpExecArray | null = expr.exec(x1);
      if (x && x.input) {
        m[i] = calc[x.input](parseFloat(a), parseFloat(b));
        m.splice(i + 1, 2);
        i -= 2;
      }
    }
  });
  return m[0];
};

export const generateDummyContent = (row: number, col: number) => {
  const val: any[][] = [];
  for (let i = 0; i < row; i++) {
    val.push(generateColumns(col));
  }
  return val;
};

export const generateColumns = (col: number) => {
  return Array.from({ length: col }, () => ({ value: "" }));
};

interface ItemsToCopy {
  index: Selected;
  data: Data;
}

export const getItemsToCopy = (selected: Selected[], data: Data[][]): ItemsToCopy[] => {
  return selected.map((d) => ({
    index: d,
    data: data[d[0]][d[1]],
  }));
};
