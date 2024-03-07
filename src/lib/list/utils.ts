const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
  headerValues?: string[]
) => {
  const header = results[0].map((d, i) => printToLetter(i, headerValues));
  results = [header, ...results];
  var CsvString = "";
  results.forEach((RowItem, RowIndex) => {
    RowItem.forEach((colVal, ColIndex) => {
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

export const getCalculatedVal = (
  val: string,
  data: any[][],
  headerValues?: string[]
): string | number => {
  try {
    val = val.toString().trim();
    val = val.substring(1, val.length);
    val = val.replaceAll(/[A-Z]+[0-9]+/gi, (x) => {
      let match = /[0-9]/.exec(x);
      if (match?.index) {
        let i: number | string = x.substring(0, match?.index);
        let j = x.substring(match?.index, x.length);
        let values = headerValues || alphabet;
        i = values.indexOf(i);
        return data[parseInt(j) - 1][i].value;
      }
      return x;
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
const solveMathExpression = (expr: string) => {
  let str = expr.replace(/ +/g, "");

  const m = [...str.matchAll(/(-?[\d.]+)([*\/+-])?/g)]
    .flat()
    .filter((x, i) => x && i % 3);

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

export const generateDummyContent = (n: number, m: number) => {
  const val: any[][] = [];
  for (let i = 0; i < n; i++) {
    val.push(Array.from({ length: m }, () => ({ value: "" })));
  }
  return val;
};
