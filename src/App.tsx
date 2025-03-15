import React, { useRef, useState } from "react";
import WithRedux, { SheetRef } from "./redux";
import { Routes, Route} from "react-router-dom";
import FirstSolution from "./worst"
import SecondSolution from "./child-componets"
import LazyLoading from "./lazyloading"
import ContextSolution from "./context"
import WithMemo from "./with-memo"
import Sheet from "./lib";
const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 1000 ; i++) {
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
    console.log(`Value Updated at ${i}, ${j}`, value);
  };
  const getData = () => {
    console.log("Updated Data", childRef?.current?.getData()); //Data will be printed in console
  };
  const exportCSV = () => {
    childRef?.current?.exportCsv("myCsvFile");
  };
  return (
   <div style={{ height: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <button data-testid="get-updated-data" onClick={getData}>
          Get Updated data
        </button>{" "}
        <button data-testid="csv-export" onClick={exportCSV}>
          Export CSV data
        </button>
      </div>
      <div style={{ height: "calc(100% - 31px)" }}>
        <Routes>
          <Route
            path="worst"
            element={
              <FirstSolution data={state} onChange={onChange} />
            }
          />
          <Route
            path="child-components"
            element={
              <SecondSolution data={state} onChange={onChange} />
            }
          />
          <Route
            path="with-memo"
            element={
              <WithMemo data={state} onChange={onChange} />
            }
          />
          <Route
            path="lazy-loading"
            element={
              <LazyLoading data={state} onChange={onChange}/>
            }
          />
          <Route
            path="context"
            element={
              <ContextSolution
                data={state}
                onChange={onChange}
              />
            }
          />
          <Route
            path="/redux"
            element={<WithRedux data={state} onChange={onChange} resize/>}
          />
          <Route
            path="/own-store"
            element={<Sheet data={state} onChange={onChange} ref={childRef} resize/>}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
