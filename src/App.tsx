import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "./lib";
import packageConf from "../package.json";


//Create dummy data.
const createData = (count?: number) => {
  const val: any[][] = [];
  for (let i = 0; i < (count || 1000) ; i++) {
    val.push(
      Array.from({ length: count || 40 }, () => ({
        value: Math.floor(Math.random() * 10),
      }))
    );
  }
  return val;
};

function App({count}: {count?: number}) {
  const [state] = useState<any[][]>(createData(count));
  const childRef = useRef<SheetRef>(null);
  const onChange = (i: number, j: number, value: string) => {
    //Do not try to update state with this action, it will slow down your application
    console.log(`Value Updated at ${i}, ${j}`, value);
  };

  //Read data from excel sheet
  const getData = () => {
    console.log("Updated Data", childRef?.current?.getData()); //Data will be printed in console
  };

  //generate CSV
  const exportCSV = () => {
    childRef?.current?.exportCsv("myCsvFile", false);
  };
  return (
    <div>
      <div>
        React excel sheet: V{packageConf.version}{" "}
        <button data-testid="get-updated-data" onClick={getData}>Get Updated data</button>{" "}
        <button data-testid="csv-export" onClick={exportCSV}>Export CSV data</button>
      </div>
      <br />
      <div>
        {/* Data is optional, if data is empty it will render empty input boxes */}
        <Sheet data={state} onChange={onChange} ref={childRef} resize={true}/>
      </div>
    </div>
  );
}

export default App;
