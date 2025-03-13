import listReducer, { Listreducer } from "./reducer";
import { AnyAction, Reducer } from "@reduxjs/toolkit";

export type RootReducer = {
  list: Reducer<Listreducer, AnyAction>;
};

export const rootReducer: RootReducer = {
  list: listReducer,
};
