import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import SheetXaxis from "../sheet-x-axis";

beforeEach(() => store.dispatch(addData, { payload: generateDummyContent(3, 3) }));
test("header cell render", () => {
  render(
    <table>
      <tbody>
        <SheetXaxis />
      </tbody>
    </table>,
  );
  expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
});

test("header cell render headervalues", async () => {
  const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  render(
    <table>
      <tbody>
        <SheetXaxis headerValues={["Test header 1", "Test header 2", "Test header 3"]} />
      </tbody>
    </table>,
  );
  expect(screen.getByTestId(`sheet-table-x-axis-header`)).toBeInTheDocument();
  expect(consoleSpy).toHaveBeenCalled();

  fireEvent.mouseDown(screen.getByText("Test header 1"));
  await waitFor(() => {
    expect(store.getState().selected).toHaveLength(3);
  });
  fireEvent.mouseDown(screen.getByTestId("0-x-axis"));
  await waitFor(() => {
    expect(store.getState().selected).toHaveLength(9);
  });
});

test("SheetXAxis with resize prop renders div wrapper inside th", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  const { container } = render(
    <table>
      <thead>
        <SheetXaxis resize />
      </thead>
    </table>,
  );
  // When resize=true, column headers wrap their content in a <div>
  const ths = container.querySelectorAll("th.sheet-x-axis");
  // At least one th should contain a div child
  const hasDiv = Array.from(ths).some((th) => th.querySelector("div"));
  expect(hasDiv).toBe(true);
});

test("SheetXAxis readOnly=true prevents cell selection on axis click", async () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  const { clearSelection } = await import("../../reducer");
  store.dispatch(clearSelection);
  render(
    <table>
      <thead>
        <SheetXaxis readOnly />
      </thead>
    </table>,
  );
  // Click on first column header — should NOT select cells in readonly mode
  fireEvent.mouseDown(screen.getByTestId("1-x-axis"));
  expect(store.getState().selected).toHaveLength(0);
});
