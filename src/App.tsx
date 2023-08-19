import React, { useState } from "react";
import Sheet from "./lib";
import packageConf from "../package.json";

const createData = () => {
  const val: any[][] = [];
  for (let i = 0; i < 400; i++) {
    val.push(Array.from({ length: 60 }, () => Math.floor(Math.random() * 10)));
  }
  return val;
};
function App() {
  const [state, setState] = useState<any[][]>(createData());

  return (
    <div>
      <div>React excel sheet: V {packageConf.version}</div>
      <div>
        <Sheet data={state} />
      </div>
    </div>
  );
}

export default App;
