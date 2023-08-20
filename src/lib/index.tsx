import React, { forwardRef, useImperativeHandle } from "react";
import { Provider } from "react-redux";
import List from "./list";
import { store } from "./store";
import "./sheet.css";
import { addData } from "./reducer";
interface Props {
  data: any[][];
  onChange?(i: number, j: number, value: string): void;
}
export type SheetRef = {
  getData: () => string[][];
  setData: (data: any[][]) => void;
};
const Sheet = forwardRef((props: Props, ref) => {
  const getData = () => {
    return store.getState().list.data;
  };
  const setData = (data: any[][]) => {
    store.dispatch(addData(data));
  };
  useImperativeHandle(ref, () => ({
    getData,
    setData,
  }));

  return (
    <Provider store={store}>
      <List data={props.data} onChange={props.onChange} />
    </Provider>
  );
});

export default Sheet;
