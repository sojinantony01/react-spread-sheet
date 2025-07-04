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
