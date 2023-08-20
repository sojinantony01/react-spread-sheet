import React, { createRef, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData } from "../reducer";
import { getCalculatedVal } from "./utils";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
}
const Cell = (props: Prop) => {
  const { i, j, onChange } = props;
  const inputRef = useRef(null);
  const { ref, inView } = useInView({
    root: document.getElementsByClassName("sheet-table")[0],
    rootMargin: "100px",
  });
  const [focused, setFocus] = useState(false);
  const dispatch = useAppDispatch();
  const value = useAppSelector((store) => {
    let val = store.list.data[i][j].value;
    if (!focused && val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, store.list.data);
    }
    return val;
  });
  const change = (e: { target: { value: any } }) => {
    dispatch(changeData({ value: e.target.value || "", i: i, j: j }));
    onChange && onChange(i, j, e.target.value);
  };
  return (
    <td ref={ref} className={`${!inView ? "pv-4" : ""}`}>
      {inView ? (
        <input
          id={`${i}-${j}`}
          value={value}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={change}
        />
      ) : (
        value
      )}
    </td>
  );
};

export default Cell;
