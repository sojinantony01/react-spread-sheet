import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { store, useAppSelector } from "../store";
import {
  changeData,
  clearSelection,
  selectCells,
  selectCellsDrag,
  selectOneCell,
} from "../reducer";
import { getCalculatedVal } from "./utils";
interface Prop {
  i: number;
  j: number;
  onChange?(i?: number, j?: number, value?: string): void;
  headerValues?: string[];
}

//Mouse clicked check
const detectLeftButton = (evt: any) => {
  if ("buttons" in evt) {
    return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
};

const Input = (props: Prop) => {
  const { i, j, onChange, headerValues } = props;
  const [editMode, setEdit] = useState(false);
  const [focus, setFocus] = useState(false);
  const { dispatch } = store;
  const selected = useAppSelector(store, (state) => {
    return state.selected.some((p) => p[0] === i && p[1] === j);
  });
  const value = useAppSelector(store, (state) => {
    let val = state.data[i][j].value;
    if (!focus && val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, state.data, headerValues);
    }
    return val;
  });
  const styles = useAppSelector(store, (state) => {
    return state.data[i][j].styles;
  });
  const rowLength = useAppSelector(store, (state) => {
    return state.data.length;
  });
  const columnLength = useAppSelector(store, (state) => {
    return state.data[i].length;
  });

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    if (value !== e.target.value) {
      setEdit(true);
      dispatch(changeData, { payload: { value: e.target.value || "", i: i, j: j } });
      onChange && onChange(i, j, e.target.value);
    }
  };
  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (!editMode && ["ArrowLeft", "ArrowRight"].includes(e.code)) ||
      ["ArrowUp", "ArrowDown"].includes(e.code)
    ) {
      dispatch(clearSelection);
      moveToNext(e);
    } else if (editMode && (e.code === "Backspace" || e.code === "Delete")) {
      e.stopPropagation();
    } else if (editMode && e.code === "KeyA" && (e.ctrlKey || e.metaKey)) {
      e.stopPropagation();
    } else if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    } else if (e.code === "KeyZ" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    } else if (
      editMode &&
      window.getSelection()?.toString() &&
      e.code === "KeyC" &&
      (e.ctrlKey || e.metaKey)
    ) {
      e.stopPropagation();
    }
  };
  const moveToNext = (e: KeyboardEvent<HTMLInputElement>) => {
    let newI, newJ;
    switch (e.code) {
      case "ArrowLeft":
        newI = i;
        newJ = j - 1;
        break;
      case "ArrowUp":
        newI = i - 1;
        newJ = j;
        break;
      case "ArrowRight":
        newI = i;
        newJ = j + 1;
        break;
      case "ArrowDown":
        newI = i + 1;
        newJ = j;
        break;
    }
    if (e.shiftKey) {
      dispatch(selectCellsDrag, { payload: { i: newI, j: newJ } });
    } else {
      setSelected(newI, newJ);
    }
    document.getElementById(`${newI}-${newJ}`)?.focus();
  };

  const setSelected = (row = i, column = j) => {
    if (row >= 0 && column >= 0 && row < rowLength && column < columnLength)
      dispatch(selectOneCell, { payload: { i: row, j: column } });
  };
  const onClick = (e: React.MouseEvent) => {
    if (detectLeftButton(e)) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        dispatch(selectCells, { payload: { i, j } });
      } else {
        selected && setEdit(true);
        setSelected();
      }
    } else {
      e.preventDefault();
      !selected && dispatch(selectOneCell, { payload: { i, j } });
    }
  };
  const onDrag = (e: any) => {
    if (detectLeftButton(e)) {
      dispatch(selectCellsDrag, { payload: { i, j } });
    }
  };
  return (
    <input
      id={`${i}-${j}`}
      data-testid={`${i}-${j}`}
      value={value}
      style={styles}
      onFocus={() => setFocus(true)}
      onKeyDown={keyDown}
      onMouseMoveCapture={onDrag}
      onMouseDown={onClick}
      className={`input ${editMode ? "" : "view_mode"} ${selected ? "sheet-selected-td" : ""}`}
      onBlur={() => {
        setEdit(false);
        setFocus(false);
      }}
      onDoubleClick={() => setEdit(true)}
      onChange={change}
    />
  );
};

export default Input;
