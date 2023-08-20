import React from "react";
import { useAppSelector } from "../store";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const printToLetter = (num: number): string => {
  let result = "";
  let charIndex = num % alphabet.length;
  let quotient = num / alphabet.length;
  if (charIndex - 1 === -1) {
    charIndex = alphabet.length;
    quotient--;
  }
  result = alphabet[charIndex - 1] + result;
  if (quotient >= 1) {
    return printToLetter(parseInt(quotient.toFixed(0))) + result;
  }
  return result;
};
const SheetXAxis = () => {
  const itemLength = useAppSelector((store) => store.list.data[0].length);
  const items: any = [];

  for (let i = 0; i <= itemLength; i++) {
    items.push(
      <td className={`sheet-axis ${i > 0 && "sheet-x-axis"}`}>
        {i > 0 && printToLetter(i)}
      </td>
    );
  }
  return <tr>{items}</tr>;
};

export default SheetXAxis;
