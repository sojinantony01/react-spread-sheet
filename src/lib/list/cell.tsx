import React from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData } from "../reducer";

interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
}
const Cell = (props: Prop) => {
  const { ref, inView } = useInView({
    root: document.getElementsByClassName("sheet-table")[0],
    rootMargin: "30px",
  });
  const dispatch = useAppDispatch();
  const value = useAppSelector((store) => store.list.data[props.i][props.j]);
  const change = (e: { target: { value: any } }) => {
    dispatch(
      changeData({ value: e.target.value || "", i: props.i, j: props.j })
    );
    props.onChange && props.onChange(props.i, props.j, e.target.value);
  };
  return (
    <td ref={ref}>
      {!inView ? (
        <div className="input-dummy"></div>
      ) : (
        <input value={value} onChange={change} />
      )}
    </td>
  );
};

export default Cell;
