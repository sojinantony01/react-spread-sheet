import React, { memo, useContext } from "react";
import { store, useAppSelector } from "../store";
import Cell from "./cell";
import ReadOnlyCell from "./readonlycell";
import { selectHorizontalCells } from "../reducer";
interface Prop {
  i: number;
  onChange?(i: number, j: number, value: string): void;
  hideYAxisHeader?: boolean;
  readonly?: boolean;
  headerValues?: string[];
}
const Row = (props: Prop) => {
  const { i } = props;
  const itemLength = useAppSelector(store, (state) => state.data[i].length);
  const items: React.JSX.Element[] = [];
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
      ),
    );
  }
  return (
    <tr data-testid="sheet-table-tr">
      {!props.hideYAxisHeader ? (
        <td
          className="sheet-axis"
          data-testid={`${i}-sheet-y-axis`}
          tabIndex={1}
          onClick={(e) => {
            store.dispatch(selectHorizontalCells, {
              payload: { i: i, ctrlPressed: e.metaKey || e.ctrlKey },
            });
          }}
        >
          {i + 1}
        </td>
      ) : (
        ""
      )}
      {items}
    </tr>
  );
};

export default memo(Row);
