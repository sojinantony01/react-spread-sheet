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
    console.log("Updated Data", childRef?.current?.getData()); //Data will be printed in console
  };

  return (
    <div>
      <div>
        React excel sheet: V {packageConf.version}{" "}
        <button onClick={getData}>Get Updated data</button>
      </div>
      <div>
        <Sheet data={state} onChange={onChange} ref={childRef} />
      </div>
    </div>
  );
}

export default App;
