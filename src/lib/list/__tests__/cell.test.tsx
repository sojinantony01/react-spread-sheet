import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import Cell from "../cell";
import {
  mockAllIsIntersecting,
} from 'react-intersection-observer/test-utils';
const i = 1;
const j = 1;
test("cell  render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(<Provider store={store}>
        <table><tbody><tr><Cell i={i} j={j}/></tr></tbody></table>
    </Provider>);
  mockAllIsIntersecting(true);
  expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
  mockAllIsIntersecting(false);
  expect(screen.queryByTestId(`${i}-${j}`)).not.toBeInTheDocument()

});
