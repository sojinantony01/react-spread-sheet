import React from "react";
import { useInView } from "react-intersection-observer";
import Input from "./input";
import { useAppSelector } from "../store";
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
  const selected = useAppSelector((store) => {
    return store.list.selected.some(p => p[0] === props.i && p[1] === props.j)
  });

  return (
    <td ref={ref} className={`${!inView ? "pv-4" : ""} ${selected ? "sheet-selected-td" : ""}`}>
      {inView ? <Input key={`${props.i}-${props.j}`} {...props} /> : " "}
    </td>
  );
};

export default Cell;
