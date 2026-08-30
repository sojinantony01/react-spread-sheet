import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import Row from "../row";

const i = 1;

const wrap = (children: React.ReactNode) => (
  <table>
    <tbody>{children}</tbody>
  </table>
);

test("read only row", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(wrap(<Row key={i} i={i} readonly />));
  expect(screen.getByTestId(`read-only-${i}-0`)).toBeInTheDocument();
});

test("row render", async () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(wrap(<Row key={i} i={i} />));
  expect(screen.getByTestId("1-sheet-y-axis")).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByTestId("1-sheet-y-axis"));
  await waitFor(() => {
    expect(store.getState().selected).toHaveLength(3);
  });
});

test("row with hideYAxisHeader does not render the axis cell", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(wrap(<Row i={i} hideYAxisHeader />));
  expect(screen.queryByTestId("1-sheet-y-axis")).not.toBeInTheDocument();
});

test("row axis click in readonly mode does not select cells", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(wrap(<Row i={i} readonly />));
  // Record selected count before click — readonly should not change it
  const before = store.getState().selected.length;
  fireEvent.mouseDown(screen.getByTestId("1-sheet-y-axis"));
  expect(store.getState().selected.length).toBe(before);
});

test("row axis ctrl+click appends columns to existing selection", async () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(
    wrap(
      <>
        <Row i={0} />
        <Row i={1} />
      </>,
    ),
  );
  // Select row 0 first
  fireEvent.mouseDown(screen.getByTestId("0-sheet-y-axis"));
  await waitFor(() => expect(store.getState().selected).toHaveLength(3));

  // Ctrl+click row 1 — should append row 1's cells
  fireEvent.mouseDown(screen.getByTestId("1-sheet-y-axis"), { ctrlKey: true });
  await waitFor(() => {
    expect(store.getState().selected).toHaveLength(6);
  });
});
