# React-spread-sheet-excel

A light weight component to Render large lists of input boxes in the table using React JS and Redux, Render a table with a large number of rows and columns.

[![npm version](https://badge.fury.io/js/react-spread-sheet-excel.svg)](https://badge.fury.io/js/react-spread-sheet-excel) ![Downloads](https://img.shields.io/npm/dm/react-spread-sheet-excel.svg)

* Can render a large number of input boxes in the table
* Light Weight
* Calculations Support, value should starts with "="
* Supports calculations in Excel cells (= 2 * A2 + (B2 * C4))
* Customizable header values - (Do not pass numbers in header values, will affect calc)
* Resize columns
* Can Use as a Spreadsheet or Excel with react
* Read-only mode
* Export to CSV support
* Move between cells using tab/shift+tab or arrow Keys keys on the keyboard
* Sticky Headers
* 100% unit test coverage

## Getting Started

Input data format
```
[
  [{value: 1},{value: 1},{value: "a"},{value: "b"},{value: "d"}]
]
```
```
npm install react-spread-sheet-excel

```
## demo
[Live demo](https://sojinantony01.github.io/react-spread-sheet/)

![alt text](https://raw.githubusercontent.com/sojinantony01/react-spread-sheet/main/public/images/samplesheet.png)

```
import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "./lib";
import packageConf from "../package.json";

const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 2000; i++) {
    val.push(Array.from({ length: 40 }, () => Math.floor(Math.random() * 10)));
  }
  return val;
};
function App() {
  const [state] = useState<any[][]>(createData());
  const childRef = useRef<SheetRef>(null);
  const onChange = (i: number, j: number, value: string) => {
    //Do not try to update state with this action, it will slow down your application
    console.log(`Value Updated at ${j}, ${j}`, value);
  };
  const getData = () => {
    console.log("Updated Data", childRef?.current?.getData()); 
  };

  return (
    <div>
      <div>
        <button onClick={getData}>Get Updated data</button>
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
| onChange | Calls when a change is detected in input boxes, Do not set render component when value changes, the component should be uncontrolled |  | No | 
| resize | show column resize option | false | No | boolean |
| hideXAxisHeader | Show serial numbers in X axis | false | No | boolean |
| hideYAxisHeader | Show serial numbers in Y axis | false | No | boolean |
| headerValues | array of header values, Number in header values could affect calculations | alphabets | No | string[] |

## Ref

| Ref | Description |
| --- | --- |
| getData | Get updated data from sheet | 
| setData | Set new data to sheet |


[Sojin Antony](https://github.com/sojinantony01)


[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg)](https://www.buymeacoffee.com/sojinantony)

## Acknowledgments

* React-intersection-observer
* Redux, React Redux
