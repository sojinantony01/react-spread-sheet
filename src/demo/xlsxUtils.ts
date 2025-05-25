import * as XLSX from "@e965/xlsx";
import { getCalculatedVal, printToLetter } from "../lib";

export const importFromXlsx = (
  file: File,
  onSuccess: (data: any[][]) => void,
  onError?: (err: Error) => void,
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 1 }) as any[][];

      const formatted = jsonData.map((row) => row.map((cell) => ({ value: cell })));
      onSuccess(formatted);
    } catch (err) {
      onError?.(err as Error);
    }
  };
  reader.readAsArrayBuffer(file);
};

export const exportToXlsx = (
  results: any[][],
  fileName = "myXlsxFile.xlsx",
  headerValues?: string[],
  includeHeaders: boolean = false,
) => {
  const header = results[0].map((d, i) => printToLetter(i + 1, headerValues));
  const aoa: any[][] = [];

  if (includeHeaders) {
    aoa.push(["", ...header]); // Add column letters as header row
  }
  results.forEach((rowItem, rowIndex) => {
    const row: any[] = [];
    if (includeHeaders) row.push(rowIndex); // Add row number
    rowItem.forEach((colVal) => {
      let val = colVal.value;
      if (typeof val === "string" && val.trim().startsWith("=")) {
        row.push(getCalculatedVal(val, results, headerValues)); // using calculated val func
      } else {
        row.push(val);
      }
    });

    aoa.push(row);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
};
