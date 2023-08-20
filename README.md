# react-excel-sheet

Render large lists of input boxes in table using React JS and Redux, Render table with large number of rows and columns.


## Getting Started

Input data format
```
[
  [1,2,3,4,5,"a","b", "d"],
  ["23","45","3",4,5,"a","b", "d"],
  [1,"w",3,"4",5,"a","b", "d"],
  [1,2,"23",4,5,"a","b", "d"]
]
```
```
npm install react-excel-sheet

```
## demo
[Live demo](https://sojinantony01.github.io/react-excel-sheet/)

![alt text](https://raw.githubusercontent.com/sojinantony01/react-excel-sheet/master/public/images/samplesheet.png)

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


[Sojin Antony](https://github.com/sojinantony01)

## Acknowledgments
