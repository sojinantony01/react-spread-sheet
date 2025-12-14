import React, { memo } from "react";
import { store, useAppSelector } from "../store";
import { getCalculatedVal } from "./utils";

interface Prop {
  i: number;
  j: number;
  headerValues?: string[];
}
const ReadOnlyCell = (props: Prop) => {
  const value = useAppSelector(store, (state) => {
    let val = state.data[props.i][props.j].value;
    if (val && val.toString().trim().startsWith("=")) {
      return getCalculatedVal(val, state.data, props.headerValues);
    }
    return val;
  });
  const colSpan = useAppSelector(store, (state) => {
    let val = state.data[props.i][props.j];
    if (val.colSpan && val.rowSpan) {
      return val.colSpan;
    }
    return 1;
  });

  const rowSpan = useAppSelector(store, (state) => {
    let val = state.data[props.i][props.j];
    if (val.colSpan && val.rowSpan) {
      return val.rowSpan;
    }
    return 1;
  });

  const skip = useAppSelector(store, (state) => {
    return state.data[props.i][props.j].skip;
  });

  const styles = useAppSelector(store, (state) => {
    return state.data[props.i][props.j].styles;
  });

  return !skip ? (
    <td colSpan={colSpan} rowSpan={rowSpan}>
      <div
        className="input input-dummy"
        data-testid={`read-only-${props.i}-${props.j}`}
        style={styles}
      >
        {value}
      </div>
    </td>
  ) : (
    <></>
  );
};

export default memo(ReadOnlyCell);
