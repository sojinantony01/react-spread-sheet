import React, { memo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
export interface Props {
  data: any[][];
  onChange?(i: number, j: number, value: string): void;
  resize?: boolean;
  showXAxisHeader?: boolean;
  showYAxisHeader?: boolean;
  headerValues?: string[];
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
        showYAxisHeader={props.showYAxisHeader}
      />
    );
  }
  return (
    <div className="sheet-table">
      {items.length && (
        <table>
          <tbody>
            {!props.showXAxisHeader && (
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
