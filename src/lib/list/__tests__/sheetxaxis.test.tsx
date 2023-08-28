import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import SheetXaxis from "../sheet-x-axis"

test("header cell render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
        <table><tbody><SheetXaxis /></tbody></table>
    </Provider>
  );
  expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
});

test("header cell render headervalues", () => {
    const consoleSpy = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => {});

    store.dispatch(addData(generateDummyContent(3, 3)));
    render(
      <Provider store={store}>
          <table><tbody><SheetXaxis headerValues={["Test header 1"]}/></tbody></table>
      </Provider>
    );
    expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();
  });
  