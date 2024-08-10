import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { changeData, clearSelection, selectCells, selectCellsDrag, selectOneCell } from "../reducer";
import { getCalculatedVal } from "./utils";
interface Prop {
  i: number;
  j: number;
  onChange?(i: number, j: number, value: string): void;
  headerValues?: string[];
}
const detectLeftButton = (evt: any) => {
  if ("buttons" in evt) {
    return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
}

const Input = (props: Prop) => {
  const { i, j, onChange, headerValues } = props;
  const [editMode, setEdit] = useState(false);
  const [focus, setFocus] = useState(false)
  const dispatch = useAppDispatch();
  const selected = useAppSelector((store) => {
    return store.list.selected.some(p => p[0] === i && p[1] === j)
  });
  const value = useAppSelector((store) => {
    let val = store.list.data[i][j].value;
    if (!focus && val && val.toString().trim().startsWith("=")) {
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
    if ((!editMode && ["ArrowLeft", "ArrowRight"].includes(e.code)) || ["ArrowUp", "ArrowDown"].includes(e.code)) {
      dispatch(clearSelection());
      moveToNext(e.code);
    } 
    else if (editMode && e.code === "Backspace") {
      e.stopPropagation();
    }
    else if (editMode && e.code === "KeyA" && (e.ctrlKey || e.metaKey)) {
      e.stopPropagation();
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
  const setSelected = () => {
    dispatch(selectOneCell({i,j}));
  }
  const onClick = (e: { ctrlKey: any; metaKey: any; }) => {
    if (e.ctrlKey || e.metaKey) {
      dispatch(selectCells({ i, j }));
    } else {
      selected && setEdit(true);
      setSelected();
    }
  }
  const onDrag = (e: any) => {
    if(detectLeftButton(e)) {
      dispatch(selectCellsDrag({i, j}))
    }
  }
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
      className={`input ${editMode ? "" : "view_mode"} ${selected ? "selected" : ""}`}
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
