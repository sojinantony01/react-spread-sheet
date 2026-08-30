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

const i = 1;
const j = 1;

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

test("read only cell renders calculated formula value", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  act(() => {
    store.dispatch(changeData, { payload: { value: "5", i: 0, j: 0 } });
    store.dispatch(changeData, { payload: { value: "=A1*2", i, j } });
  });
  render(wrap(<ReadOnlyCell i={i} j={j} />));
  expect(screen.getByTestId(`read-only-${i}-${j}`).textContent).toBe("10");
});

test("read only cell respects colSpan and rowSpan when both are set", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  act(() => {
    store.dispatch(changeData, { payload: { value: "merged", i: 0, j: 0, colSpan: 2, rowSpan: 2 } });
    // Manually set the spans via store — the reducer stores whatever value object is passed
    const state = store.getState();
    const newRow = state.data[0].slice();
    newRow[0] = { ...newRow[0], colSpan: 2, rowSpan: 2 };
    const newData = state.data.slice();
    newData[0] = newRow;
    store.dispatch(addData, { payload: newData });
  });
  render(wrap(<ReadOnlyCell i={0} j={0} />));
  const td = screen.getByTestId("read-only-0-0").closest("td");
  expect(td).toHaveAttribute("colspan", "2");
  expect(td).toHaveAttribute("rowspan", "2");
});

test("read only cell applies styles when present", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  act(() => {
    const state = store.getState();
    const newRow = state.data[i].slice();
    newRow[j] = { ...newRow[j], styles: { color: "red" } };
    const newData = state.data.slice();
    newData[i] = newRow;
    store.dispatch(addData, { payload: newData });
  });
  render(wrap(<ReadOnlyCell i={i} j={j} />));
  const el = screen.getByTestId(`read-only-${i}-${j}`);
  expect(el).toHaveStyle({ color: "rgb(255, 0, 0)" });
});

test("read only cell renders nothing (fragment) when skip is true", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  act(() => {
    const state = store.getState();
    const newRow = state.data[i].slice();
    newRow[j] = { ...newRow[j], skip: true };
    const newData = state.data.slice();
    newData[i] = newRow;
    store.dispatch(addData, { payload: newData });
  });
  const { container } = render(wrap(<ReadOnlyCell i={i} j={j} />));
  expect(screen.queryByTestId(`read-only-${i}-${j}`)).not.toBeInTheDocument();
  // Only the axis tr wrapper td — no extra td from ReadOnlyCell
  expect(container.querySelectorAll("td")).toHaveLength(0);
});
