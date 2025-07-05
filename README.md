# React-spread-sheet-excel
React spread sheet excel is a high-performance React component for building Excel-like spreadsheets with advanced features.

A **simple very light weight(<200KB)** component to Render large lists of input boxes in the table using React JS, Render a table with a large number of rows and columns.
Able to render 100000+ input boxes in react, A quick solution for web based spreadsheet or excel.

[![npm version](https://badge.fury.io/js/react-spread-sheet-excel.svg)](https://badge.fury.io/js/react-spread-sheet-excel) ![Downloads](https://img.shields.io/npm/dm/react-spread-sheet-excel.svg)
  <a href="https://codecov.io/gh/sojinantony01/react-spread-sheet" > 
 <img src="https://codecov.io/gh/sojinantony01/react-spread-sheet/graph/badge.svg?token=OLGA3TDJIL"/> 
 </a>
  <a href="https://github.com/sojinantony01/react-spread-sheet/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/react-spread-sheet-excel.svg" alt="license">
  </a>

## [Live Demo](https://sojinantony01.github.io/react-spread-sheet/)

[Demo](https://sojinantony01.github.io/react-spread-sheet/)

[npm package - react spread sheet excel](https://www.npmjs.com/package/react-spread-sheet-excel)

## Features

* __Blazing Fast Rendering: Handles large datasets efficiently (100000+ input boxes).__
* __Comprehensive Calculation Engine: Supports complex formulas and calculations. (= 2 * A2 + (B2 * C4))__
* __Rich Formatting Options: Customize cell appearance with bold, italic, underline, and more.__
* __Merge cells.__
* __Undo, Redo actions.__
* __Calculations Support, value should starts with "="__
* __Select Multiple cells.__
* __copy, cut and paste all selected cells.__
* __Intuitive Keyboard Navigation: Navigate and edit cells effortlessly.__
* __Delete values in selected cells.__
* __Customizable header values - (Do not pass numbers in header values, will affect calc)__
* __Resize columns__
* __Can Use as a Spreadsheet or Excel with react__
* __Flexible Data Management: Import, export, and manipulate data.__
* __Customizable Headers and Columns: Tailor the spreadsheet to your application.__
* __Read-Only Mode: Protect data from accidental modifications.__
* __CSV Export: Easily share data in a common format.__
* __Sticky Headers: Keep headers visible while scrolling.__
* __100% Unit Test Coverage: Ensures reliability and stability.__
* __JSON based SpreadSheet__

![React-spread-sheet-excel](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/react-spread-sheet-excel.png)


## Getting Started

Input data format
```json
[
  [{"value": 1},{"value": 1},{"value": "a"},{"value": "b"},{"value": "d"}]
]
```

```
npm install react-spread-sheet-excel

```

![React-spread-sheet-excel](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/react-spread-sheet-excel-formatted.png)

![React-spread-sheet-excel-gif](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/react-spread-sheet-excel-ezgif.com-video-to-gif-converter.gif)


## Example

```js
import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "react-spread-sheet-excel";

//Create dummy data.
const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 500 ; i++) {
    val.push(
      Array.from({ length: 30 }, () => ({
        value: "",
      }))
    );
  }
  return val;
};

function App() {
  const [state] = useState<any[][]>(createData());
  const childRef = useRef<SheetRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChange = (i: number, j: number, value: string) => {
    //Do not try to update state with this action, it will slow down your application
    console.log(`Value Updated at ${j}, ${j}`, value);
  };

  const getData = () => {
    console.log("Updated Data", childRef?.current?.getData()); 
  };

  //Generate CSV
  const exportCSV = () => {
    childRef?.current?.exportCsv("myCsvFile", false);
  };

  return (
    <div>
      <div>
        <button onClick={getData}>Get Updated data</button>
        <button data-testid="csv-export" onClick={exportCSV}>Export CSV data</button>
        <button onClick={() => exportToXlsx(childRef?.current?.getData() ?? [])}>Export XLSX</button>
        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={handleFileChange}
          />
          <button onClick={handleImportClick}>Import XLSX</button>
        </label>
      </div>
      <div>
        <Sheet data={state} onChange={onChange} ref={childRef} />
      </div>
    </div>
  );
}

export default App;

```

## props

| Prop | Description | Default | Mandatory | type
| --- | --- | -- | -- | -- |
| data | Array of array with values (matrix)  | [[]]  |  No | any[][] |
| onChange | Calls when a change is detected in input boxes, Do not set render component when value changes, the component should be uncontrolled, All arguments will be undefined for bulk changes |  | No | 
| resize | show column resize option | false | No | boolean |
| hideXAxisHeader | Show serial numbers in X axis | false | No | boolean |
| hideYAxisHeader | Show serial numbers in Y axis | false | No | boolean |
| headerValues | array of header values, Number in header values could affect calculations | alphabets | No | string[] |
| hideTools | Hide tools | false | No | boolean |
| autoAddAdditionalRows | sheet adds additional rows automatically | true | No | boolean |


## Ref (API's)

| Ref | Description | Params |
| --- | --- | --- |
| getData | Get updated data from sheet |  |
| setData | Set new data to sheet | [{ value: string; styles?: {[key: string]: string}}, ...] |
| exportCsv | Export to CSV | filename: (Mandatory), IncludeHeaders (default false) |
| updateOneCell | Update One cell Value | (row: number, col: number, value: string) |
| getOneCell | Get once cell value | (row: number, col: number) | 


## XLSX Export/Import

```
npm i @e965/xlsx
```

```js
import React, { useRef, useState } from "react";
import { getCalculatedVal, printToLetter } from "react-spread-sheet-excel";
import * as XLSX from "@e965/xlsx";


const importFromXlsx = (
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

const exportToXlsx = (
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

//Create dummy data.
const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 500 ; i++) {
    val.push(
      Array.from({ length: 30 }, () => ({
        value: "",
      }))
    );
  }
  return val;
};

function App() {
  const [state] = useState<any[][]>(createData());
  const childRef = useRef<SheetRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e:any) =>{
    const file = e.target.files?.[0];
    if (file) {
      importFromXlsx(file, (data) => {
        childRef?.current?.setData(data);
      });
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => exportToXlsx(childRef?.current?.getData() ?? [])}>Export XLSX</button>
        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={handleFileChange}
          />
          <button onClick={handleImportClick}>Import XLSX</button>
        </label>
      </div>
      <div>
        <Sheet data={state} onChange={onChange} ref={childRef} />
      </div>
    </div>
  );
}

export default App;

```

## Try here
[Sandbox](https://codesandbox.io/p/sandbox/dry-water-gy2g6k)

[Stackblitz](https://stackblitz.com/edit/react-xr6ifg?file=src%2FApp.js)

## Performance

Benchmark: Rendered 1000 rows and 100 columns in mills.
Optimization Techniques: Global state, Lazy loading.


[Sojin Antony](https://github.com/sojinantony01)


[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg)](https://www.buymeacoffee.com/sojinantony)

## Acknowledgments

* React-intersection-observer



