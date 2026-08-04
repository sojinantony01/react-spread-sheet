import React, { ChangeEvent, KeyboardEvent, useState, useCallback, useRef, memo } from "react";
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

const detectLeftButton = (evt: any) => {
  if ("buttons" in evt) {
    return evt.buttons === 1;
  }
  const button = evt.which || evt.button;
  return button === 1;
};

const Input = (props: Prop) => {
  const { i, j, onChange, headerValues } = props;
  const [editMode, setEdit] = useState(false);
  // Track focus in a ref — it only affects the value selector, not JSX output,
  // so it doesn't need to be state that triggers its own re-render cycle.
  const focusRef = useRef(false);
  const { dispatch } = store;

  // O(1) selected check via the pre-computed Set in the store.
  const selected = useAppSelector(store, () => store.getSelectedSet().has(`${i},${j}`));

  const value = useAppSelector(store, (state) => {
    const val = state.data[i][j].value;
    if (!focusRef.current && val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, state.data, headerValues);
    }
    return val;
  });

  // Parse inside the selector so the component receives a stable object reference
  // when styles content hasn't changed (JSON.stringify → same string → Object.is bails out).
  const styles = useAppSelector(store, (state) => {
    const s = state.data[i][j].styles;
    return s ? JSON.stringify(s) : undefined;
  });
  const parsedStyles: React.CSSProperties | undefined = styles ? JSON.parse(styles) : undefined;

  const type = useAppSelector(store, (state) => state.data[i][j].type || "text");

  const change = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (value !== e.target.value) {
        setEdit(true);
        dispatch(changeData, { payload: { value: e.target.value || "", i, j } });
        onChange && onChange(i, j, e.target.value);
      }
    },
    [value, i, j, onChange, dispatch],
  );

  const findNext = (
    ci: number,
    cj: number,
    dir: "up" | "down" | "left" | "right",
    rowLen: number,
    colLen: number,
  ): { i: number; j: number } => {
    if (
      document.getElementById(`${ci}-${cj}`) ||
      (dir === "up" && ci === 0) ||
      (dir === "left" && cj === 0) ||
      (dir === "down" && ci === rowLen - 1) ||
      (dir === "right" && cj === colLen - 1)
    ) {
      return { i: ci, j: cj };
    }
    return findNext(
      dir === "up" ? ci - 1 : dir === "down" ? ci + 1 : ci,
      dir === "left" ? cj - 1 : dir === "right" ? cj + 1 : cj,
      dir,
      rowLen,
      colLen,
    );
  };

  const setSelected = useCallback(
    (row = i, column = j) => {
      const { data } = store.getState();
      if (row >= 0 && column >= 0 && row < data.length && column < data[i].length)
        dispatch(selectOneCell, { payload: { i: row, j: column } });
    },
    [i, j, dispatch],
  );

  const moveToNext = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const { data } = store.getState();
      const rowLen = data.length;
      const colLen = data[i].length;
      let newI: number | undefined;
      let newJ: number | undefined;
      switch (e.code) {
        case "ArrowLeft":
          newI = i;
          newJ = j > 0 ? findNext(i, j - 1, "left", rowLen, colLen).j : j;
          break;
        case "ArrowUp":
          newI = i > 0 ? findNext(i - 1, j, "up", rowLen, colLen).i : i;
          newJ = j;
          break;
        case "ArrowRight":
          newI = i;
          newJ = j < colLen - 1 ? findNext(i, j + 1, "right", rowLen, colLen).j : j;
          break;
        case "ArrowDown":
          newI = i < rowLen - 1 ? findNext(i + 1, j, "down", rowLen, colLen).i : i;
          newJ = j;
          break;
      }
      if (e.shiftKey) {
        dispatch(selectCellsDrag, { payload: { i: newI, j: newJ } });
      } else {
        setSelected(newI, newJ);
      }
      document.getElementById(`${newI}-${newJ}`)?.focus();
    },
    [i, j, dispatch, setSelected],
  );

  const keyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
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
    },
    [editMode, dispatch, moveToNext],
  );

  const onClick = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [selected, setSelected, i, j, dispatch],
  );

  const onDrag = useCallback(
    (e: any) => {
      if (detectLeftButton(e)) {
        dispatch(selectCellsDrag, { payload: { i, j } });
      }
    },
    [i, j, dispatch],
  );

  // No useMemo wrapper — Input only re-renders when one of its store slices
  // (selected, value, styles, type) or local state (editMode) changes, so
  // the memo was paying cost for zero benefit.
  return (
    <input
      key={`${i}-${j}-${type}`}
      id={`${i}-${j}`}
      data-testid={`${i}-${j}`}
      value={value}
      style={parsedStyles}
      type={type}
      onFocus={() => { focusRef.current = true; }}
      onBlur={() => { focusRef.current = false; setEdit(false); }}
      onMouseMoveCapture={onDrag}
      onMouseDown={onClick}
      className={`input${editMode ? "" : " view_mode"}${selected ? " sheet-selected-td" : ""}`}
      onDoubleClick={() => setEdit(true)}
      onKeyDown={keyDown}
      onChange={change}
    />
  );
};

export default memo(Input);
