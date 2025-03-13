import React, { useContext } from "react";
import Column  from "./column";
import { DataContext } from ".";

const Row = ({ i }) => {
    const { data } = useContext(DataContext);

    return (
        <tr>
        {data[i].map((p, j) => {
            return <Column key={`row-${i}-col-${j}`} i={i} j={j}/>;
        })}
        </tr>
    );
};

export default Row;
