import React from "react";
import { Provider } from "react-redux";
import List from "./list";
import { store } from "./store";
import "./sheet.css";
interface Props {
  data: any[][];
}
const Sheet = (props: Props) => {
  return (
    <Provider store={store}>
      <List data={props.data} />
    </Provider>
  );
};

export default Sheet;
