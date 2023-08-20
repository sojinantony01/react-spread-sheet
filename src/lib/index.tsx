import React, { forwardRef, useImperativeHandle } from "react";
import { Provider } from "react-redux";
import List, { Props } from "./list";
import { store } from "./store";
import "./sheet.css";
import { addData } from "./reducer";

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
      <List {...props} />
    </Provider>
  );
});

export default Sheet;
