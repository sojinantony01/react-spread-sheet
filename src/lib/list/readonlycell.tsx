import React, { useContext } from "react";
import { store, useAppSelector } from "../store";

interface Prop {
  i: number;
  j: number;
}
const ReadOnlyCell = (props: Prop) => {
  const value = useAppSelector(store, (state) => state.data[props.i][props.j].value);
  return (
    <td>
      <div className="input input-dummy" data-testid={`read-only-${props.i}-${props.j}`}>{value}</div>
    </td>
  );
};

export default ReadOnlyCell;
