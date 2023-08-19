import React from "react";
import { useAppSelector } from "../store";

const SheetXAxis = () => {
  const itemLength = useAppSelector((store) => store.list.data[0].length);
  const items: any = [];

  for (let i = 0; i <= itemLength; i++) {
    items.push(<td className="sheet-axis">{i}</td>);
  }
  return <tr>{items}</tr>;
};

export default SheetXAxis;
