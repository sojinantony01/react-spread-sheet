import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "./lib";
import packageConf from "../package.json";

const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 1000; i++) {
    val.push(
      Array.from({ length: 40 }, () => ({
        value: Math.floor(Math.random() * 10),
      }))
    );
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
    console.log("Updated Data", childRef?.current?.getData()); //Data will be printed in console
  };
  const exportCSV = () => {
    childRef?.current?.exportCsv("myCsvFile");
  };
  return (
    <div>
      <div>
        React excel sheet: V{packageConf.version}{" "}
        <button data-testid="get-updated-data" onClick={getData}>Get Updated data</button>{" "}
        <button onClick={exportCSV}>Export CSV data</button>
      </div>
      <br />
      <div>
        <Sheet data={state} onChange={onChange} ref={childRef} resize={true}/>
      </div>
    </div>
  );
}

export default App;
