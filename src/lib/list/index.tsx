import React, { memo, useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData, deleteSelectItems, selectAllCells, updateStyles } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
import { generateDummyContent } from "./utils";
import Tools from "./tools/tools"
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
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);

  const divRef = useRef<HTMLDivElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);
  const [j, setJ] = useState(0);
  useEffect(() => {
    setJ(itemLength < 300 ? itemLength : 300);
  }, [itemLength]);
  useEffect(() => {
    dispatch(addData(props.data ? props.data : generateDummyContent(1000, 30)));
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
      />
    );
  }
  const onsCroll = () => {
    const el = divRef.current;
    const parentEl = parentDivRef.current;
    if (el && parentEl && parentEl?.scrollTop > el?.scrollHeight - 2800) {
      const nextVal = 300 + Math.round(parentEl?.scrollTop / 28);
      setJ(nextVal > itemLength ? itemLength : nextVal);
    }
  };
  const handleKeyDown = (e: { code: string; ctrlKey: any; metaKey: any; }) => {
    if (e.code === "KeyA" && (e.ctrlKey || e.metaKey)) {
      dispatch(selectAllCells());
    }
    if (e.code === "Backspace") {
      dispatch(deleteSelectItems());
    } else if (e.code === "KeyB" && (e.ctrlKey || e.metaKey)) {
      changeStyle("B");
    } else if (e.code === "KeyU" && (e.ctrlKey || e.metaKey)) {
      changeStyle("U");
    } else if (e.code === "KeyI" && (e.ctrlKey || e.metaKey)) {
      changeStyle("I");
    }
  }
  const getStyle = (key: string, value?:string) => {
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
    dispatch(updateStyles(getStyle(key, value)));
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="sheet-table"
      onScroll={onsCroll}
      ref={parentDivRef}
      data-testid="sheet-table"
    >
      {!props.hideTools && <Tools changeStyle={changeStyle}/>}
      <div style={{ height: (itemLength + 1) * 28 }}>
        <div ref={divRef}>
          {items.length && (
            <table>
              <tbody>
                {!props.hideXAxisHeader ? <SheetXAxis resize={props.resize} headerValues={props.headerValues} /> : ""}
                {items}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(List);
