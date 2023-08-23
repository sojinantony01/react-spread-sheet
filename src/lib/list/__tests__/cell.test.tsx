import React from "react";
import { render, screen } from "@testing-library/react";
import Input from "../input";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";
let i = 1;
let j = 1;

test("should create a hook inView", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  mockAllIsIntersecting(true);
  expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
});
