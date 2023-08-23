import React from "react";
import { render, screen } from "@testing-library/react";
import Input from "../input";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";

let i = 1;
let j = 1;
test("input render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );

  expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
});
test("input render value", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  const data = store.getState().list.data;
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue(data[i][j].value);
});
