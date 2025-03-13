import React, { createContext, Profiler, useMemo, useState } from "react";
import Table from "./table"

export const DataContext = createContext({ data: [[{value: ""}]], getValue: (i,j) => "", updateData: (i, j, val) => {} });
const App = (props) => {
  const [data, setData] = useState(props.data);
   const contextValue = useMemo(
     () => ({ 
      data,
      getValue: (i, j) => data[i][j].value,
      updateData: (i, j, val) => {
        const temp = [...data];
        temp[i][j] = { value: val };
        setData(temp);
      }
    }),
    [data]
   );

  return (
    <Profiler id="myprofiler" onRender={(id, phase, actualDuration) => console.log("rendered ", id, phase, actualDuration)}>
      <DataContext.Provider value={contextValue}>
        <Table />
      </DataContext.Provider>
    </Profiler>
  );
};

export default App;