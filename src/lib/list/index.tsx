import React, { memo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
export interface Props {
  data: any[][];
  onChange?(i: number, j: number, value: string): void;
  resize?: boolean;
  hideXAxisHeader?: boolean;
  hideYAxisHeader?: boolean;
  headerValues?: string[];
  readonly?: boolean;
}
const List = (props: Props) => {
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);
  useEffect(() => {
    dispatch(addData(props.data));
  }, []);
  const items = [];
  for (let i = 0; i < itemLength; i++) {
    items.push(
      <Row
        i={i}
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
