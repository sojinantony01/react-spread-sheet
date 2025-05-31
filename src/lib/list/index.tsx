import React, { memo, useEffect, useRef, useState } from "react";
import { store, useAppSelector } from "../store";
import Row from "./row";
import { addData, deleteSelectItems, redo, selectAllCells, undo, updateStyles } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
import { generateDummyContent } from "./utils";
import Tools from "./tools/tools";
import ContextMenu from "./context-menu";

export interface Props {
  data?: any[][];
  onChange?(i: number, j: number, value: string): void;
  resize?: boolean;
  hideXAxisHeader?: boolean;
  hideYAxisHeader?: boolean;
  headerValues?: string[];
  readonly?: boolean;
  hideTools?: boolean;
}

const List = (props: Props) => {
  const { dispatch } = store;
  const itemLength = useAppSelector(store, (state) => state.data.length);
  const divRef = useRef<HTMLDivElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);
  const [j, setJ] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setJ(itemLength < 300 ? itemLength : 300);
  }, [itemLength]);

  useEffect(() => {
    dispatch(addData, {
      payload:
        props.data && props.data.length && props.data[0].length
          ? props.data
          : generateDummyContent(1000, 30),
    });
  }, []);

  const items = [];
  for (let i = 0; i < j; i++) {
    items.push(
      <Row
        i={i}
        key={i}
        headerValues={props.headerValues}
        onChange={props.onChange}
        hideYAxisHeader={props.hideYAxisHeader}
        readonly={props.readonly}
      />,
    );
  }

  const onsCroll = () => {
    const el = divRef.current;
    const parentEl = parentDivRef.current;
    if (el && parentEl && parentEl?.scrollTop > el?.scrollHeight - 3200) {
      const nextVal = 300 + Math.round(parentEl?.scrollTop / 32);
      setJ(nextVal > itemLength ? itemLength : nextVal);
    }
  };

  const handleKeyDown = (e: { shiftKey: boolean; code: string; ctrlKey: any; metaKey: any }) => {
    if (e.code === "KeyA" && (e.ctrlKey || e.metaKey)) {
      dispatch(selectAllCells);
    }
    if (e.code === "Backspace") {
      dispatch(deleteSelectItems);
    } else if (e.code === "KeyB" && (e.ctrlKey || e.metaKey)) {
      changeStyle("B");
    } else if (e.code === "KeyU" && (e.ctrlKey || e.metaKey)) {
      changeStyle("U");
    } else if (e.code === "KeyI" && (e.ctrlKey || e.metaKey)) {
      changeStyle("I");
    } else if (e.code === "KeyZ" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      dispatch(redo);
    } else if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey) && !props.readonly) {
      dispatch(undo);
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
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div 
      onKeyDown={handleKeyDown} 
      className="sheet-table" 
      data-testid="sheet-table"
      onContextMenu={handleContextMenu}
    >
      {!props.hideTools && <Tools changeStyle={changeStyle} onChange={props.onChange} />}
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
                  {!props.hideXAxisHeader ? (
                    <SheetXAxis resize={props.resize} headerValues={props.headerValues} />
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
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default memo(List);
