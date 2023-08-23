import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData } from "../reducer";
import { getCalculatedVal } from "./utils";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
  headerValues?: string[];
}

const Input = (props: Prop) => {
  const { i, j, onChange, headerValues } = props;
  const [focused, setFocus] = useState(false);
  const [editMode, setEdit] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dispatch = useAppDispatch();
  const value = useAppSelector((store) => {
    let val = store.list.data[i][j].value;
    if (!focused && val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, store.list.data, headerValues);
    }
    return val;
  });
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    if (value !== e.target.value) {
      setEdit(true);
      dispatch(changeData({ value: e.target.value || "", i: i, j: j }));
      onChange && onChange(i, j, e.target.value);
    }
  };
  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (!editMode && [37, 39].includes(e.keyCode)) ||
      [38, 40].includes(e.keyCode)
    ) {
      moveToNext(e.keyCode);
    }
  };
  const moveToNext = (keyCode: number) => {
    switch (keyCode) {
      case 37:
        document.getElementById(`${i}-${j - 1}`)?.focus();
        break;
      case 38:
        document.getElementById(`${i - 1}-${j}`)?.focus();
        break;
      case 39:
        document.getElementById(`${i}-${j + 1}`)?.focus();
        break;
      case 40:
        document.getElementById(`${i + 1}-${j}`)?.focus();
        break;
    }
  };

  return (
    <input
      id={`${i}-${j}`}
      data-testid={`${i}-${j}`}
      value={value}
      onFocus={() => setFocus(true)}
      onKeyDown={keyDown}
      className={`${editMode ? "" : "view_mode"}`}
      onBlur={() => {
        setFocus(false);
        setEdit(false);
        setClicked(false);
      }}
      onClick={() => (!clicked ? setClicked(true) : setEdit(true))}
      onDoubleClick={() => setEdit(true)}
      onChange={change}
    />
  );
};

export default Input;
