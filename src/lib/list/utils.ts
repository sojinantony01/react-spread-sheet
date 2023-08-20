import { evaluate } from "mathjs";
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
        CsvString += getCalculatedVal(val, results) + ",";
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
  data: any[][]
): string | number => {
  try {
    val = val.toString().trim();
    val = val.substring(1, val.length);

    return evaluate(val);
  } catch (e) {
    return val;
  }
};
