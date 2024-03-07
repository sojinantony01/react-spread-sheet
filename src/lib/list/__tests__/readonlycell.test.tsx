import React from "react";
import { render, screen } from "@testing-library/react";
import ReadOnlyCell from "../readonlycell";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";

let i = 1;
let j = 1;

test("read only cell render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
        <table><tbody><tr>
          <ReadOnlyCell i={i} j={j} />
        </tr></tbody></table>
    </Provider>
  );
  expect(screen.getByTestId(`read-only-${i}-${j}`)).toBeInTheDocument();
});
