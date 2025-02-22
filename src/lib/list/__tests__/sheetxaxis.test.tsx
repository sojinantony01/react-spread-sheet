import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import SheetXaxis from "../sheet-x-axis"

test("header cell render", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(
        <table><tbody><SheetXaxis /></tbody></table>
  );
  expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
});

test("header cell render headervalues", () => {
    const consoleSpy = jest
    .spyOn(console, 'warn')
    .mockImplementation(() => {});

    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(
          <table><tbody><SheetXaxis headerValues={["Test header 1"]}/></tbody></table>
    );
    expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Test header 1"));
    expect(store.getState().selected).toHaveLength(3)
    fireEvent.click(screen.getByTestId("0-x-axis"));
    expect(store.getState().selected).toHaveLength(9);

  });
  