import React, { memo } from "react";
import { useAppSelector } from "../store";
import Cell from "./cell";
import ReadOnlyCell from "./readonlycell";
interface Prop {
  i: number;
  onChange?(i: number, j: number, value: string): void;
  hideYAxisHeader?: boolean;
  readonly?: boolean;
  headerValues?: string[];
}
const Row = (props: Prop) => {
  const { i } = props;
  const itemLength = useAppSelector((store) => store.list.data[i].length);
  const items = [];
  for (let j = 0; j < itemLength; j++) {
    items.push(
      props.readonly ? (
        <ReadOnlyCell key={`${i}-${j}-ReadOnly`} i={i} j={j} />
      ) : (
        <Cell
          key={`${i}-${j}`}
          i={i}
          j={j}
          onChange={props.onChange}
          headerValues={props.headerValues}
        />
      )
    );
  }
  return (
    <tr>
      {!props.hideYAxisHeader && <td className="sheet-axis">{i + 1}</td>}
      {items}
    </tr>
  );
};

export default memo(Row);
