import React, { useRef, useState } from "react";
import Sheet, { SheetRef } from "../lib";
import packageConf from "../../package.json";
import { importFromXlsx, exportToXlsx } from "./xlsxUtils";
//Create dummy data.
const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 1000; i++) {
    val.push(
      Array.from({ length: 40 }, () => ({
        value: Math.floor(Math.random() * 10),
      })),
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromXlsx(file, (data) => {
        childRef?.current?.setData(data);
      });
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <a href="https://www.npmjs.com/package/react-spread-sheet-excel">React excel sheet: V{packageConf.version}</a>{" "}
        <button data-testid="get-updated-data" onClick={getData}>
          Get Updated data
        </button>{" "}
        <button data-testid="csv-export" onClick={exportCSV}>
          Export CSV data
        </button>{" "}
        <button onClick={() => exportToXlsx(childRef?.current?.getData() ?? [])}>
          Export XLSX
        </button>{" "}
        <label>
          <input ref={fileInputRef} type="file" accept=".xlsx" hidden onChange={handleFileChange} />
          <button onClick={handleImportClick}>Import XLSX</button>
        </label>
      </div>
      <div style={{ height: "calc(100% - 31px)" }}>
        {/* Data is optional, if data is empty it will render empty input boxes */}
        <Sheet data={state} onChange={onChange} ref={childRef} resize={true} />
      </div>
    </div>
  );
}

export default App;
