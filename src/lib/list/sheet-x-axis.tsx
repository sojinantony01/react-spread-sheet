import React from "react";
import { useAppSelector } from "../store";
import { printToLetter } from "./utils";
interface Props {
  resize?: boolean;
  headerValues?: string[];
}

const SheetXAxis = ({ resize, headerValues }: Props) => {
  const itemLength = useAppSelector((store) => store.list.data[0].length);
  const items: any = [];
  for (let i = 0; i <= itemLength; i++) {
    items.push(
      <td
        className={`sheet-axis ${i > 0 && "sheet-x-axis"}`}
        key={`${i}-x-axis`}
      >
        {resize && i > 0 ? (
          <div>{printToLetter(i, headerValues)}</div>
        ) : (
          i > 0 && printToLetter(i, headerValues)
        )}
      </td>
    );
  }
  return <tr>{items}</tr>;
};

export default SheetXAxis;
