import React from "react";
import { useAppSelector } from "../store";

interface Prop {
  i: number;
  j: number;
}
const ReadOnlyCell = (props: Prop) => {
  const value = useAppSelector((store) => store.list.data[props.i][props.j].value);
  return (
    <td>
      <div className="input-dummy" data-testid={`read-only-${props.i}-${props.j}`}>{value}</div>
    </td>
  );
};

export default ReadOnlyCell;
