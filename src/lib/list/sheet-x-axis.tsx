import React, { useEffect } from "react";
import { store, useAppSelector } from "../store";
import { printToLetter } from "./utils";
import { selectAllCells, selectVerticalCells } from "../reducer";

interface Props {
  resize?: boolean;
  headerValues?: string[];
}

const SheetXAxis = ({ resize, headerValues }: Props) => {
  const { dispatch } = store;
  const itemLength = useAppSelector(store, (state) => state.data[0].length);
  const items: any = [];
  useEffect(() => {
    if (headerValues?.find((d) => d.match(/[0-9]/))) {
      console.warn("React-spread-sheet-excel: Header values should not contain numbers");
    }
  }, [headerValues]);
  for (let i = 0; i <= itemLength; i++) {
    items.push(
      <th
        className={`sheet-axis ${i > 0 && "sheet-x-axis"}`}
        key={`${i}-x-axis`}
        data-testid={`${i}-x-axis`}
        tabIndex={0}
        onMouseDown={(e) => {
          if (i === 0) {
            dispatch(selectAllCells);
          } else
            dispatch(selectVerticalCells, {
              payload: { j: i - 1, ctrlPressed: e.metaKey || e.ctrlKey },
            });
        }}
      >
        {resize && i > 0 ? (
          <div>{printToLetter(i, headerValues)}</div>
        ) : (
          i > 0 && printToLetter(i, headerValues)
        )}
      </th>,
    );
  }
  return <tr data-testid="sheet-table-x-axis-header">{items}</tr>;
};

export default SheetXAxis;
