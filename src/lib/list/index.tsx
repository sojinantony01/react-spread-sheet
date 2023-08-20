import React, { memo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
interface Props {
  data: any[][];
  onChange?(i: number, j: number, value: string): void;
}
const List = (props: Props) => {
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);
  useEffect(() => {
    dispatch(addData(props.data));
  }, []);
  const items = [];
  for (let i = 0; i < itemLength; i++) {
    items.push(<Row i={i} onChange={props.onChange} />);
  }

  return (
    <div className="sheet-table">
      {items.length && (
        <table>
          <tbody>
            <SheetXAxis />
            {items}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default memo(List);
