import React, { memo } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData } from "../reducer";

interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
}
const Input = (props: Prop) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector((store) => store.list.data[props.i][props.j]);
  const change = (e: { target: { value: any } }) => {
    dispatch(
      changeData({ value: e.target.value || "", i: props.i, j: props.j })
    );
    props.onChange && props.onChange(props.i, props.j, e.target.value);
  };
  return (
    <input
      // ref={inputRef}
      // autoFocus
      value={value}
      onChange={change}
      // onBlur={() => setShow(false)}
    />
  );
};

export default memo(Input);
