import React from "react";
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

  const colSpan = useAppSelector(store, (state) => {
    let val = state.data[props.i][props.j];
    if (val.colSpan && val.rowSpan) {
      return val.colSpan;
    }
    return 1;
  });

  const rowSpan = useAppSelector(store, (state) => {
    let val = state.data[props.i][props.j];
    if (val.colSpan && val.rowSpan) {
      return val.rowSpan;
    }
    return 1;
  });

  const skip = useAppSelector(store, (state) => {
    return state.data[props.i][props.j].skip;
  });

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

export default Cell;
