import React from "react";
import { useAppSelector } from "../store";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
interface Props {
  resize?: boolean;
  headerValues?: string[];
}
const SheetXAxis = ({ resize, headerValues }: Props) => {
  const itemLength = useAppSelector((store) => store.list.data[0].length);
  const items: any = [];
  const printToLetter = (num: number): string => {
    let result = "";
    const values =
      headerValues && headerValues.length ? headerValues : alphabet;
    let charIndex = num % values.length;
    let quotient = num / values.length;
    if (charIndex - 1 === -1) {
      charIndex = values.length;
      quotient--;
    }
    result = values[charIndex - 1] + result;
    if (quotient >= 1) {
      return printToLetter(parseInt(quotient.toFixed(0))) + result;
    }
    return result;
  };
  for (let i = 0; i <= itemLength; i++) {
    items.push(
      <td
        className={`sheet-axis ${i > 0 && "sheet-x-axis"}`}
        key={`${i}-x-axis`}
      >
        {resize && i > 0 ? (
          <div>{printToLetter(i)}</div>
        ) : (
          i > 0 && printToLetter(i)
        )}
      </td>
    );
  }
  return <tr>{items}</tr>;
};

export default SheetXAxis;
