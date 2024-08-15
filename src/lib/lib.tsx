import React, { forwardRef, useImperativeHandle } from "react";
import { Provider } from "react-redux";
import List, { Props } from "./list";
import { store } from "./store";
import "./sheet.css";
import { addData, Data } from "./reducer";
import { exportToCsv } from "./list/utils";
export type SheetRef = {
  getData: () => string[][];
  setData: (data: any[][]) => void;
  exportCsv: (fileName: string, includeHeaders?: boolean) => void;
};
const Sheet = forwardRef((props: Props, ref) => {
  const getData = () => {
    return store.getState().list.data;
  };
  const setData = (data: Data[][]) => {
    store.dispatch(addData(data));
  };
  const exportCsv = (fileName: string, includeHeaders: boolean = false) => {
    let results = store.getState().list.data;
    exportToCsv(results, fileName, props.headerValues, includeHeaders);
  };

  useImperativeHandle(ref, () => ({
    getData,
    setData,
    exportCsv,
  }));

  return (
    <Provider store={store}>
      <List {...props} />
    </Provider>
  );
});

export default Sheet;
