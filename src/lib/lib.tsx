import React, { forwardRef, useImperativeHandle } from "react";
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
    return store.getState().data;
  };
  const setData = (data: Data[][]) => {
    store.dispatch(addData, { payload: data });
  };
  const exportCsv = (fileName: string, includeHeaders: boolean = false) => {
    let results = store.getState().data;
    exportToCsv(results, fileName, props.headerValues, includeHeaders);
  };

  useImperativeHandle(ref, () => ({
    getData,
    setData,
    exportCsv,
  }));

  return <List {...props} />;
});

export default Sheet;
