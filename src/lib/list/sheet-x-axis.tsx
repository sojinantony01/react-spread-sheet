import React, { useEffect } from "react";
import { useAppSelector } from "../store";
import { printToLetter } from "./utils";
interface Props {
  resize?: boolean;
  headerValues?: string[];
}

const SheetXAxis = ({ resize, headerValues }: Props) => {
  const itemLength = useAppSelector((store) => store.list.data[0].length);
  const items: any = [];
  useEffect(() => {
    if (headerValues?.find((d) => d.match(/[0-9]/))) {
      console.warn(
        "React-spread-sheet-excel: Header values should not contain numbers"
      );
    }
  }, [headerValues]);
  for (let i = 0; i <= itemLength; i++) {
    items.push(
      <th
        className={`sheet-axis ${i > 0 && "sheet-x-axis"}`}
        key={`${i}-x-axis`}
      >
        {resize && i > 0 ? (
          <div>{printToLetter(i, headerValues)}</div>
        ) : (
          i > 0 && printToLetter(i, headerValues)
        )}
      </th>
    );
  }
  return <tr data-testid="sheet-table-x-axis-header">{items}</tr>;
};

export default SheetXAxis;
