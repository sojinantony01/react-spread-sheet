import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import Row from "../row";
const i = 1;

test("read only row", () => {
    store.dispatch(addData(generateDummyContent(3, 3)));
    render(
      <Provider store={store}>
        <table>
          <tbody>
            <Row key={i} i={i} readonly />
          </tbody>
        </table>
      </Provider>,
    );
    expect(screen.getByTestId(`read-only-${i}-0`)).toBeInTheDocument();
})
test("row  render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
        <table><tbody><Row key={i} i={i}/></tbody></table>
    </Provider>
  );
  expect(screen.getByTestId("1-sheet-y-axis")).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("1-sheet-y-axis"));
  expect(store.getState().list.selected).toHaveLength(3);
});
