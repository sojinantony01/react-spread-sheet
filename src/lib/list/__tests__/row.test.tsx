import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import Row from "../row";
const i = 1;
test("row  render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
        <table><tbody><Row key={i} i={i} readonly/></tbody></table>
    </Provider>
  );
  expect(screen.getByTestId(`read-only-${i}-0`)).toBeInTheDocument();
});
