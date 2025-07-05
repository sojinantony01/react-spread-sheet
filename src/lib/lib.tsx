import React, { forwardRef, useImperativeHandle } from "react";
import List, { Props } from "./list";
import { store } from "./store";
import "./sheet.css";
import { addData, changeData, Data } from "./reducer";
import { exportToCsv } from "./list/utils";
export type SheetRef = {
  getData: () => Data[][];
  setData: (data: Data[][]) => void;
  exportCsv: (fileName: string, includeHeaders?: boolean) => void;
  updateOneCell: (row: number, col: number, value: any) => void;
  getOneCell: (row: number, col: number) => Data;
};

const Sheet = forwardRef((props: Props, ref) => {
  const getData = (): Data[][] => {
    return store.getState().data;
  };
  const setData = (data: Data[][]): void => {
    store.dispatch(addData, { payload: data });
  };

  const updateOneCell = (row: number, col: number, value: any) => {
    store.dispatch(changeData, { payload: { row, col, value } });
  };

  const getOneCell = (row: number, col: number): Data => {
    return store.getState().data[row][col];
  };

  const exportCsv = (fileName: string, includeHeaders: boolean = false) => {
    let results = store.getState().data;
    exportToCsv(results, fileName, props.headerValues, includeHeaders);
  };

  useImperativeHandle(ref, () => ({
    getData,
    setData,
    updateOneCell,
    getOneCell,
    exportCsv,
  }));

  return <List {...props} />;
});

export default Sheet;
