import React from "react";
import { render, screen, act } from "@testing-library/react";
import ReadOnlyCell from "../readonlycell";
import { store } from "../../store";
import { addData, changeData, mergeCells, selectOneCell, selectCellsDrag } from "../../reducer";
import { generateDummyContent } from "../utils";

const wrap = (children: React.ReactNode) => (
  <table>
    <tbody>
      <tr>{children}</tr>
    </tbody>
  </table>
);

beforeEach(() => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
});

test("read only cell render", () => {
  render(wrap(<ReadOnlyCell i={1} j={1} />));
  expect(screen.getByTestId("read-only-1-1")).toBeInTheDocument();
});

test("read only cell displays plain text value", () => {
  act(() => {
    store.dispatch(changeData, { payload: { value: "hello", i: 0, j: 0 } });
  });
  render(wrap(<ReadOnlyCell i={0} j={0} />));
  expect(screen.getByTestId("read-only-0-0")).toHaveTextContent("hello");
});

test("read only cell evaluates a formula and displays the result", () => {
  act(() => {
    store.dispatch(changeData, { payload: { value: 5, i: 0, j: 0 } });
    store.dispatch(changeData, { payload: { value: "=A1+3", i: 0, j: 1 } });
  });
  render(wrap(<ReadOnlyCell i={0} j={1} />));
  expect(screen.getByTestId("read-only-0-1")).toHaveTextContent("8");
});

test("read only cell applies styles", () => {
  act(() => {
    store.dispatch(addData, {
      payload: [[{ value: "styled", styles: { fontWeight: "bold" } }]],
    });
  });
  render(wrap(<ReadOnlyCell i={0} j={0} />));
  const el = screen.getByTestId("read-only-0-0");
  expect(el).toHaveStyle({ fontWeight: "bold" });
});

test("merged cell renders with colSpan and rowSpan", async () => {
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
    store.dispatch(mergeCells);
  });
  render(
    <table>
      <tbody>
        <tr>
          <ReadOnlyCell i={0} j={0} />
          <ReadOnlyCell i={0} j={1} />
        </tr>
        <tr>
          <ReadOnlyCell i={1} j={0} />
          <ReadOnlyCell i={1} j={1} />
        </tr>
      </tbody>
    </table>,
  );
  // The merged cell is at 0-0; skipped cells should render nothing (empty fragment)
  expect(screen.getByTestId("read-only-0-0")).toBeInTheDocument();
  // Skipped cells (skip=true) should not render a testid
  expect(screen.queryByTestId("read-only-0-1")).not.toBeInTheDocument();
});
