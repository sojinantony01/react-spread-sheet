import React from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData } from "../reducer";

interface Prop {
  i: number;
  j: number;
}
const Input = (props: Prop) => {
  const dispatch = useAppDispatch();
  const { ref, inView } = useInView({
    root: document.getElementsByClassName("sheet-table")[0],
    rootMargin: "100px",
  });
  const value = useAppSelector((store) => store.list.data[props.i][props.j]);
  const change = (e: { target: { value: any } }) => {
    dispatch(
      changeData({ value: e.target.value || "", i: props.i, j: props.j })
    );
  };
  return (
    <td ref={ref}>
      {!inView ? (
        <div className="input-dummy">{value}</div>
      ) : (
        <input
          // ref={inputRef}
          // autoFocus
          value={value}
          onChange={change}
          // onBlur={() => setShow(false)}
        />
      )}
    </td>
  );
};

export default Input;
