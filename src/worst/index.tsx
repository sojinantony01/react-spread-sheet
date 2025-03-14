import React from "react";
import { useState } from "react";
const App = (props) => {
    const [data, setData] = useState(props.data)
    const update = (e, i, j) => {
        const temp = [...data]
        temp[i][j] = {value: e.target.value}
        setData(temp)
    }
    return (
        <div className="sheet-table-worst">
          <table>
            <tbody>{data.map((d, i) => {
              return <tr key={`row-${i}`}>{d.map((p, j) => {
                  return <td className="pv-4" key={`row-${i}-col-${j}`}><input value={p.value} onChange={(e)=>update(e, i, j)}/></td>;
              })}</tr>
            })}</tbody>
          </table>
        </div>
    );
}
export default App;