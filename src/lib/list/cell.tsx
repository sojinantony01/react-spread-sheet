import React, { memo } from "react";
import { useInView } from "react-intersection-observer";
import Input from "./input";
import { store, useAppSelector } from "../store";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
  headerValues?: string[];
}

const Cell = (props: Prop) => {
  const { ref, inView } = useInView({
    root: document.getElementsByClassName("sheet-table")[0],
    rootMargin: "100px",
  });

  // Single selector reads the cell once and returns a serialized key so Object.is works.
  // Avoids two separate reads of state.data[i][j] for colSpan/rowSpan.
  const spanKey = useAppSelector(store, (state) => {
    const val = state.data[props.i][props.j];
    return val.colSpan && val.rowSpan ? `${val.colSpan},${val.rowSpan}` : "1,1";
  });
  const [colSpan, rowSpan] = spanKey.split(",").map(Number);

  const skip = useAppSelector(store, (state) => state.data[props.i][props.j].skip);

  return !skip ? (
    <td
      ref={ref}
      className={`${!inView ? "pv-4 sheet-not-in-view-table" : ""}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {inView ? <Input key={`${props.i}-${props.j}`} {...props} /> : " "}
    </td>
  ) : (
    <></>
  );
};

export default memo(Cell);
