import React, { useContext } from "react";
import Row from "./row";
import { DataContext } from ".";

const App = (props) => {
  const data = useContext(DataContext);

  return (
    <div className="sheet-table-2">
      <table>
        <tbody>
          {data.data.map((d, i) => {
            return <Row key={`row-${i}`} i={i}/>;
          })}
        </tbody>
      </table>
    </div>
  );
};
export default App;
