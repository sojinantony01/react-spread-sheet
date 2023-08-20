import React, { memo } from "react";
import { useAppSelector } from "../store";
import Cell from "./cell";
import ReadOnlyCell from "./readonlycell";
interface Prop {
  i: number;
  onChange?(i: number, j: number, value: string): void;
  hideYAxisHeader?: boolean;
  readonly?: boolean;
}
const Row = (props: Prop) => {
  const itemLength = useAppSelector((store) => store.list.data[props.i].length);
  const items = [];

  for (let i = 0; i < itemLength; i++) {
    items.push(
      props.readonly ? (
        <ReadOnlyCell i={props.i} j={i} />
      ) : (
        <Cell i={props.i} j={i} onChange={props.onChange} />
      )
    );
  }
  return (
    <tr>
      {!props.hideYAxisHeader && <td className="sheet-axis">{props.i + 1}</td>}
      {items}
    </tr>
  );
};

export default memo(Row);
