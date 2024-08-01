import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData, updateStyles } from "../reducer";
import { getCalculatedVal } from "./utils";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
  headerValues?: string[];
}

const Input = (props: Prop) => {
  const { i, j, onChange, headerValues } = props;
  const [editMode, setEdit] = useState(false);
  const [clicked, setClicked] = useState(false);
  const dispatch = useAppDispatch();
  const value = useAppSelector((store) => {
    let val = store.list.data[i][j].value;
    if (!clicked && val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, store.list.data, headerValues);
    }
    return val;
  });
  const styles = useAppSelector((store) => {
    return store.list.data[i][j].styles;
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
      (!editMode && ["ArrowLeft", "ArrowRight"].includes(e.code)) ||
      ["ArrowUp", "ArrowDown"].includes(e.code)
    ) {
      moveToNext(e.code);
    }
    else if (e.code === "KeyB" && (e.ctrlKey || e.metaKey)) {
      dispatch(updateStyles({i, j, value: {key: "fontWeight", value: "bold"}}));
    }
    else if (e.code === "KeyU" && (e.ctrlKey || e.metaKey)) {
      dispatch(updateStyles({ i, j, value: { key: "text-decoration", value: "underline" } }));
    }
    else if (e.code === "KeyI" && (e.ctrlKey || e.metaKey)) {
      dispatch(updateStyles({ i, j, value: { key: "fontStyle", value: "italic" } }));
    }
  };
  const moveToNext = (code: string) => {
    switch (code) {
      case "ArrowLeft":
        document.getElementById(`${i}-${j - 1}`)?.focus();
        break;
      case "ArrowUp":
        document.getElementById(`${i - 1}-${j}`)?.focus();
        break;
      case "ArrowRight":
        document.getElementById(`${i}-${j + 1}`)?.focus();
        break;
      case "ArrowDown":
        document.getElementById(`${i + 1}-${j}`)?.focus();
        break;
    }
  };

  return (
    <input
      id={`${i}-${j}`}
      data-testid={`${i}-${j}`}
      value={value}
      style={styles}
      onFocus={() => setClicked(true)}
      onKeyDown={keyDown}
      className={`${editMode ? "" : "view_mode"}`}
      onBlur={() => {
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
