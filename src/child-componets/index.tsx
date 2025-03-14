import React from "react";
import { useState } from "react";
import Row from "./row";

const App = (props) => {
  const [data, setData] = useState(props.data);
  const update = (e, i, j) => {
    const temp = [...data];
    temp[i][j] = { value: e.target.value };
    setData(temp);
  };
  return (
    <div className="sheet-table-2">
      <table>
        <tbody>
          {data.map((d, i) => {
            return (
                <Row key={`row-${i}`} data={d} i={i} update={update}/>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default App;
