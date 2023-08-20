import React, { memo } from "react";
import { useAppSelector } from "../store";
import Input from "./input";
interface Prop {
  i: number;
  onChange?(i: number, j: number, value: string): void;
}
const Row = (props: Prop) => {
  const itemLength = useAppSelector((store) => store.list.data[props.i].length);
  const items = [];

  for (let i = 0; i < itemLength; i++) {
    items.push(<Input i={props.i} j={i} onChange={props.onChange} />);
  }
  return (
    <tr>
      <td className="sheet-axis">{props.i + 1}</td>
      {items}
    </tr>
  );
};

export default memo(Row);
