import React, { memo, useEffect } from "react";
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
const generateDummyContent = () => {
  const val: any[][] = [];
  for (let i = 0; i < 100; i++) {
    val.push(Array.from({ length: 30 }, () => ({ value: "" })));
  }
  return val;
};
const List = (props: Props) => {
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);
  useEffect(() => {
    dispatch(addData(props.data ? props.data : generateDummyContent()));
  }, []);
  const items = [];
  for (let i = 0; i < itemLength; i++) {
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
  return (
    <div className="sheet-table">
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
  );
};

export default memo(List);
