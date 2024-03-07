import React, { useContext } from "react";
import { useState } from "react";
import Row from "./row";
import { DataContext } from ".";

const App = (props) => {
  const data = useContext(DataContext);

  return (
    <div className="sheet-table">
      <table>
        <tbody>
          {data.data.map((d, i) => {
            return <Row i={i}/>;
          })}
        </tbody>
      </table>
    </div>
  );
};
export default App;
