import React, { useState } from "react";
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

  return (
    <td ref={ref} className={`${!inView ? "pv-4 sheet-not-in-view-table" : ""}`}>
      {inView ? <Input key={`${props.i}-${props.j}`} {...props} /> : " "}
    </td>
  );
};

export default Cell;
