import React, { memo, useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
export interface Props {
  data?: any[][];
  onChange?(i: number, j: number, value: string): void;
  resize?: boolean;
  hideXAxisHeader?: boolean;
  hideYAxisHeader?: boolean;
  headerValues?: string[];
  readonly?: boolean;
}
export const generateDummyContent = (n: number) => {
  const val: any[][] = [];
  for (let i = 0; i < n; i++) {
    val.push(Array.from({ length: 30 }, () => ({ value: "" })));
  }
  return val;
};
const List = (props: Props) => {
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);
  const divRef = useRef<HTMLDivElement>(null)
  const parentDivRef = useRef<HTMLDivElement>(null)
  const [j, setJ] = useState(0);
  useEffect(()=> {
    setJ(itemLength < 300 ? itemLength : 300)
  }, [itemLength])
  useEffect(() => {
    dispatch(addData(props.data ? props.data : generateDummyContent(1000)));
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
    if(el && parentEl && parentEl?.scrollTop > el?.scrollHeight - 2800) {
      const nextVal = 300 + Math.round(parentEl?.scrollTop / 28)
      setJ(nextVal > itemLength ? itemLength : nextVal)
    }
  }
  return (
    <div
      className="sheet-table"
      onScroll={onsCroll}
      ref={parentDivRef}
    >
      <div style={{height: (itemLength + 1) * 28}}>
        <div ref={divRef}>
          {items.length && (
          <table>
            <tbody>
              {!props.hideXAxisHeader && (
                <SheetXAxis
                  resize={props.resize}
                  headerValues={props.headerValues}
                />
              )}
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
