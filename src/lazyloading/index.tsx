import React, { Profiler } from "react";
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
    <Profiler id="myprofiler" onRender={(id, phase, actualDuration) => console.log("rendered ", id, phase, actualDuration)}>
      <div className="sheet-table-4">
        <table>
          <tbody>
            {data.map((d, i) => {
              return (
                  <Row key={`row-${i}`}  data={d} i={i} update={update}/>
              );
            })}
          </tbody>
        </table>
      </div>
    </Profiler>
  );
};
export default App;
