import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store";
import Row from "./row";
import { addData } from "../reducer";
import SheetXAxis from "./sheet-x-axis";
interface Props {
  data: any[][];
}
const List = (props: Props) => {
  const dispatch = useAppDispatch();
  const itemLength = useAppSelector((store) => store.list.data.length);
  useEffect(() => {
    dispatch(addData(props.data));
  }, []);
  const items = [];
  for (let i = 0; i < itemLength; i++) {
    items.push(<Row i={i} />);
  }
  return (
    <div className="sheet-table">
      <table>
        <SheetXAxis />
        {items}
      </table>
    </div>
  );
};

export default List;
