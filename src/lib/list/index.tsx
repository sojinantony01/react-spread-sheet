import React, { memo, useEffect, useRef, useState } from "react";
import { store, useAppSelector } from "../store";
import Row from "./row";
import {
  addData,
  addRows,
  bulkUpdate,
  changeData,
  deleteSelectItems,
  redo,
  selectAllCells,
  undo,
  updateStyles,
} from "../reducer";
import SheetXAxis from "./sheet-x-axis";
import { generateDummyContent, getItemsToCopy } from "./utils";
import Tools from "./tools/tools";
import ContextMenu from "./context-menu";

export interface Props {
  data?: any[][];
  onChange?(i?: number, j?: number, value?: string): void;
  resize?: boolean;
  hideXAxisHeader?: boolean;
  hideYAxisHeader?: boolean;
  headerValues?: string[];
  readonly?: boolean;
  hideTools?: boolean;
  autoAddAdditionalRows?: boolean;
}

const List = (props: Props) => {
  const { dispatch } = store;
  const itemLength = useAppSelector(store, (state) => state.data.length);
  const divRef = useRef<HTMLDivElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);
  const [j, setJ] = useState(0);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [initialItemLength, setInitialItemLength] = useState(itemLength);
  const {
    data,
    onChange,
    resize,
    hideXAxisHeader,
    hideYAxisHeader,
    headerValues,
    readonly,
    hideTools,
    autoAddAdditionalRows = true,
  } = props;

  useEffect(() => {
    if (j !== 0 && itemLength > initialItemLength) {
      setJ(initialItemLength);
    } else {
      setJ(itemLength < 300 ? itemLength : 300);
    }
    setInitialItemLength(itemLength);
  }, [itemLength]);

  useEffect(() => {
    dispatch(addData, {
      payload:
        data && data.length && data[0].length
          ? [
              ...data,
              ...(data.length < 200 && autoAddAdditionalRows
                ? generateDummyContent(300, data[0].length)
                : []),
            ]
          : generateDummyContent(1000, 30),
    });
  }, []);

  const items = [];
  for (let i = 0; i < j; i++) {
    items.push(
      <Row
        i={i}
        key={i}
        headerValues={headerValues}
        onChange={onChange}
        hideYAxisHeader={hideYAxisHeader}
        readonly={readonly}
      />,
    );
  }

  const onsCroll = () => {
    const el = divRef.current;
    const parentEl = parentDivRef.current;
    if (el && parentEl && parentEl?.scrollTop > el?.scrollHeight - 3200) {
      const nextVal = 300 + Math.round(parentEl?.scrollTop / 32);
      if (autoAddAdditionalRows && nextVal >= itemLength && itemLength < 2000) {
        //Add additional rows
        dispatch(addRows, { payload: generateDummyContent(300, store.getState().data[0].length) });
      } else {
        setJ(nextVal > itemLength ? itemLength : nextVal);
      }
    }
  };

  const copyToClipBoard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(getItemsToCopy(store.getState().selected, store.getState().data)),
    );
  };

  const cutItemsToClipBoard = () => {
    copyToClipBoard();
    dispatch(deleteSelectItems);
    onChange && onChange();
  };

  const pasteFromClipBoard = () => {
    navigator.clipboard.readText().then((v) => {
      const selected = store.getState().selected;
      try {
        const val = JSON.parse(v);
        if (Array.isArray(val) && val.length > 0 && val[0].index?.length === 2 && selected.length) {
          dispatch(bulkUpdate, { payload: val });
          onChange && onChange();
        } else {
          throw new Error("execute catch part");
        }
      } catch {
        if (selected.length) {
          const i = selected[0][0];
          const j = selected[0][1];
          dispatch(changeData, { payload: { value: v || "", i: i, j: j } });
          onChange && onChange(i, j, v);
        }
      }
    });
  };
  const handleKeyDown = (e: {
    preventDefault(): unknown;
    shiftKey: boolean;
    code: string;
    ctrlKey: any;
    metaKey: any;
  }) => {
    if (e.code === "KeyA" && (e.ctrlKey || e.metaKey)) {
      dispatch(selectAllCells);
    }
    if (e.code === "Backspace" || e.code === "Delete") {
      dispatch(deleteSelectItems);
      onChange && onChange();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
      e.preventDefault();
      copyToClipBoard();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyX") {
      e.preventDefault();
      cutItemsToClipBoard();
      onChange && onChange();
    } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
      e.preventDefault();
      pasteFromClipBoard();
      onChange && onChange();
    } else if (e.code === "KeyB" && (e.ctrlKey || e.metaKey)) {
      changeStyle("B");
      onChange && onChange();
    } else if (e.code === "KeyU" && (e.ctrlKey || e.metaKey)) {
      changeStyle("U");
      onChange && onChange();
    } else if (e.code === "KeyI" && (e.ctrlKey || e.metaKey)) {
      changeStyle("I");
      onChange && onChange();
    } else if (e.code === "KeyZ" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      dispatch(redo);
      onChange && onChange();
    } else if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey) && !readonly) {
      dispatch(undo);
      onChange && onChange();
    }
  };

  const getStyle = (key: string, value?: string) => {
    switch (key) {
      case "B":
        return { value: { key: "fontWeight", value: "bold" } };
      case "U":
        return { value: { key: "text-decoration", value: "underline" } };
      case "I":
        return { value: { key: "fontStyle", value: "italic" } };
      case "ALIGN-LEFT":
        return { value: { key: "textAlign", value: "left" } };
      case "ALIGN-CENTER":
        return { value: { key: "textAlign", value: "center" } };
      case "ALIGN-RIGHT":
        return { value: { key: "textAlign", value: "right" } };
      case "ALIGN-JUSTIFY":
        return { value: { key: "textAlign", value: "justify" } };
      case "FONT":
        return { value: { key: "fontSize", value: value ? value + "px" : "" }, replace: true };
      case "COLOR":
        return { value: { key: "color", value: value }, replace: true };
      case "BACKGROUND":
        return { value: { key: "background", value: value }, replace: true };
    }
  };

  const changeStyle = (key: string, value?: string) => {
    dispatch(updateStyles, { payload: getStyle(key, value) });
    onChange && onChange();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="sheet-table"
      data-testid="sheet-table"
      onContextMenu={handleContextMenu}
    >
      {!hideTools && <Tools changeStyle={changeStyle} onChange={onChange} />}
      <div
        className="sheet-table-table-container"
        ref={parentDivRef}
        onScroll={onsCroll}
        data-testid="sheet-table-content"
      >
        <div style={{ height: (itemLength + 1) * 32 }}>
          <div ref={divRef}>
            {items.length && (
              <table>
                <tbody>
                  {!hideXAxisHeader ? (
                    <SheetXAxis resize={resize} headerValues={headerValues} />
                  ) : (
                    ""
                  )}
                  {items}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          copyToClipBoard={copyToClipBoard}
          cutItemsToClipBoard={cutItemsToClipBoard}
          pasteFromClipBoard={pasteFromClipBoard}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default memo(List);
