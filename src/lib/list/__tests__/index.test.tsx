import React, { act } from "react";
import { cleanup, fireEvent, screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import List from "../index";
import { store } from "../../store";
import { generateDummyContent } from "../utils";
import { changeData, selectCellsDrag, selectOneCell } from "../../reducer";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

describe("index tests", () => {
  afterEach(() => {
    cleanup();
  });

  test("Table render", async () => {
    render(<List data={generateDummyContent(310, 1)} />);
    expect(store.getState().data.length).toBe(310);
    const tr = await screen.findAllByTestId("sheet-table-tr");
    expect(tr).toHaveLength(300);
    fireEvent.scroll(screen.getByTestId(`sheet-table-content`), { target: { scrollTo: 300 * 28 } });
    // Optional: Add waitFor/check for more rows if needed
  });

  test("Table KeyboardActions", async () => {
    const onChange = jest.fn();
    render(<List data={generateDummyContent(10, 1)} onChange={onChange} />);
    const table = screen.getByTestId(`sheet-table`);
    fireEvent.keyDown(table, { code: "KeyA", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().selected).toHaveLength(310);
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
    expect(onChange).toHaveBeenCalledTimes(7);
  });

  test("Undo-Redo", async () => {
    const onChange = jest.fn();
    render(<List data={generateDummyContent(10, 1)} onChange={onChange} />);
    const table = screen.getByTestId(`sheet-table`);

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
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  test("copy-paste, cut-paste", async () => {
    userEvent.setup();
    render(<List data={generateDummyContent(10, 1)} />);
    mockAllIsIntersecting(true);
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    });
    act(() => {
      store.dispatch(changeData, {
        payload: { value: "1", i: 0, j: 0 },
      });
    });
    act(() => {
      store.dispatch(changeData, {
        payload: { value: "2", i: 1, j: 0 },
      });
    });
    act(() => {
      store.dispatch(changeData, {
        payload: { value: "3", i: 2, j: 0 },
      });
    });
    act(() => {
      store.dispatch(selectCellsDrag, { payload: { i: 2, j: 0 } });
    });
    const table = screen.getByTestId(`sheet-table`);
    fireEvent.keyDown(table, { code: "KeyC", ctrlKey: true });
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 3, j: 0 } });
    });
    fireEvent.keyDown(table, { key: "V", code: "KeyV", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByTestId(`3-0`)).toHaveValue("1");
    });
    expect(screen.getByTestId(`4-0`)).toHaveValue("2");
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 2, j: 0 } });
    });
    fireEvent.keyDown(table, { code: "KeyX", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByTestId(`0-0`)).toHaveValue("");
    });
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 3, j: 0 } });
    });
    fireEvent.keyDown(table, { key: "V", code: "KeyV", ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByTestId(`3-0`)).toHaveValue("1");
    });
  });

  test("paste a normal value", async () => {
    userEvent.setup();
    render(<List data={generateDummyContent(10, 1)} />);
    mockAllIsIntersecting(true);
    navigator.clipboard.writeText("test value");
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    });
    const table = screen.getByTestId(`sheet-table`);
    fireEvent.keyDown(table, { key: "V", code: "KeyV", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByTestId(`0-0`)).toHaveValue("test value");
    });

    navigator.clipboard.writeText(JSON.stringify([{ index: [], data: ["testValue"] }]));
    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
    });
    fireEvent.keyDown(table, { key: "V", code: "KeyV", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByTestId(`1-0`)).toHaveValue(`[{"index":[],"data":["testValue"]}]`);
    });
  });
});
