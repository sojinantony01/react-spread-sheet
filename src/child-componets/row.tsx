import React from "react";
import Column  from "./column";

const Row = ({ data, update, i }) => {
  return (
        <tr>
        {data.map((p, j) => {
            return <Column data={p} update={update} i={i} j={j}/>;
        })}
        </tr>
    );
};

export default Row;
