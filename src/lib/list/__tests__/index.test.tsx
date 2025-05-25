import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import List from "../index";
import { store } from "../../store";
import { generateDummyContent } from "../utils";

describe("index tests", () => {
  afterEach(() => {
    cleanup();
  });

  test("Table render", async () => {
    const { findAllByTestId, getByTestId } = render(<List data={generateDummyContent(310, 1)} />);
    expect(store.getState().data.length).toBe(310);
    const tr = await findAllByTestId("sheet-table-tr");
    expect(tr).toHaveLength(300);
    fireEvent.scroll(getByTestId(`sheet-table-content`), { target: { scrollTo: 300 * 28 } });
    // Optional: Add waitFor/check for more rows if needed
  });

  test("Table KeyboardActions", async () => {
    const { getByTestId } = render(<List data={generateDummyContent(10, 1)} />);
    const table = getByTestId(`sheet-table`);
    fireEvent.keyDown(table, { code: "KeyA", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().selected).toHaveLength(10);
    });

    fireEvent.keyDown(table, { code: "Backspace" });
    await waitFor(() => {
      expect(store.getState().data[0][0].value).toBe("");
    });

    fireEvent.keyDown(table, { code: "KeyB", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });

    fireEvent.keyDown(table, { code: "KeyU", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["text-decoration"]).toBe("underline");
    });

    fireEvent.keyDown(table, { code: "KeyI", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontStyle"]).toBe("italic");
    });
  });

  test("Undo-Redo", async () => {
    const { getByTestId } = render(<List data={generateDummyContent(10, 1)} />);
    const table = getByTestId(`sheet-table`);

    fireEvent.keyDown(table, { code: "KeyB", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });

    // undo
    fireEvent.keyDown(table, { code: "KeyZ", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontWeight"]).toBe(undefined);
    });

    fireEvent.keyDown(table, { code: "KeyZ", ctrlKey: true, shiftKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });
  });
});
