import React from "react";
import { useState } from "react";
import "./worst.css"
const App = (props) => {
    const [data, setData] = useState(props.data)
    const update = (e, i, j) => {
        const temp = [...data]
        temp[i][j] = {value: e.target.value}
        setData(temp)
    }
    return (
      <div className="sheet-table">
        <table>
          <tbody>{data.map((d, i) => {
            return <tr>{d.map((p, j) => {
                return <td className="pv-4"><input value={p.value} onChange={(e)=>update(e, i, j)}/></td>;
            })}</tr>
          })}</tbody>
        </table>
      </div>
    );
}
export default App;