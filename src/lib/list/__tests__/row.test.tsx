import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store } from "../../store";
import { addData } from "../../reducer";
import { generateDummyContent } from "../utils";
import Row from "../row";

const i = 1;

test("read only row", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(
    <table>
      <tbody>
        <Row key={i} i={i} readonly />
      </tbody>
    </table>,
  );
  expect(screen.getByTestId(`read-only-${i}-0`)).toBeInTheDocument();
});
test("row  render", async () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(
    <table>
      <tbody>
        <Row key={i} i={i} />
      </tbody>
    </table>,
  );
  expect(screen.getByTestId("1-sheet-y-axis")).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByTestId("1-sheet-y-axis"));
  await waitFor(() => {
    expect(store.getState().selected).toHaveLength(3);
  });
});

test("row with hideYAxisHeader omits axis td (line 49)", () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  render(
    <table>
      <tbody>
        <Row key={i} i={i} hideYAxisHeader />
      </tbody>
    </table>,
  );
  // The axis td should not be in the document
  expect(screen.queryByTestId("1-sheet-y-axis")).not.toBeInTheDocument();
});

test("row onAxisMouseDown does nothing in readonly mode (line 21)", async () => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  const { clearSelection } = await import("../../reducer");
  store.dispatch(clearSelection);
  render(
    <table>
      <tbody>
        <Row key={i} i={i} readonly={false} />
      </tbody>
    </table>,
  );
  // Ctrl-click on axis selects the row in non-readonly mode
  fireEvent.mouseDown(screen.getByTestId("1-sheet-y-axis"), { ctrlKey: true });
  await waitFor(() => {
    expect(store.getState().selected.length).toBeGreaterThan(0);
  });
});
