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
    render(
      <div style={{ height: "600px" }}>
        {`tr {height: 30}`}
        <List data={generateDummyContent(310, 1)} />
      </div>,
    ); //Style required to find scroll height and fire onScroll
    expect(store.getState().data.length).toBe(310);

    const tr = await screen.findAllByTestId("sheet-table-tr");
    expect(tr).toHaveLength(300);

    const scrollable = screen.getByTestId(`sheet-table-content`);

    fireEvent.scroll(scrollable, { target: { scrollTop: 4000 } });

    const tr2 = await screen.findAllByTestId("sheet-table-tr");
    expect(tr2).toHaveLength(310);
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

    fireEvent.keyDown(table, { code: "KeyB", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontWeight"]).toBe(undefined);
    });

    fireEvent.keyDown(table, { code: "KeyU", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["text-decoration"]).toBe("underline");
    });

    fireEvent.keyDown(table, { code: "KeyI", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontStyle"]).toBe("italic");
    });

    const fontInput = screen.getByTestId("font-size-input");
    expect(fontInput).toBeInTheDocument();
    fireEvent.change(fontInput, { target: { value: "23" } });
    fireEvent.keyDown(fontInput);
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontStyle"]).toBe("italic");
    });

    const fontDecrease = screen.getByTestId("font-size-decrease");
    expect(fontDecrease).toBeInTheDocument();
    fireEvent.click(fontDecrease);
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["fontSize"]).toBe("22px");
    });

    const left = screen.getByTestId("align-left");
    expect(left).toBeInTheDocument();
    fireEvent.click(left);
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["textAlign"]).toBe("left");
    });

    const right = screen.getByTestId("align-right");
    expect(right).toBeInTheDocument();
    fireEvent.click(right);
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["textAlign"]).toBe("right");
    });

    const center = screen.getByTestId("align-center");
    expect(center).toBeInTheDocument();
    fireEvent.click(center);

    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["textAlign"]).toBe("center");
    });

    const justify = screen.getByTestId("align-justify");
    expect(justify).toBeInTheDocument();
    fireEvent.click(justify);
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["textAlign"]).toBe("justify");
    });

    const color = screen.getByTestId("font-color");
    expect(color).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("font-color-button"));
    fireEvent.change(color, { target: { value: "#ffffff" } });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["color"]).toBe("#ffffff");
    });

    const background = screen.getByTestId("background-color");
    expect(background).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("background-color-button"));
    fireEvent.change(background, { target: { value: "#ffffff" } });
    await waitFor(() => {
      expect(store.getState().data?.[0][0]?.styles?.["background"]).toBe("#ffffff");
    });
    expect(onChange).toHaveBeenCalledTimes(17);
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

  test("select bottom to top and paste", async () => {
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
    const table = screen.getByTestId(`sheet-table`);

    act(() => {
      store.dispatch(selectOneCell, { payload: { i: 2, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 0, j: 0 } });
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
    expect(screen.getByTestId(`4-0`)).toHaveValue("2");
    expect(screen.getByTestId(`5-0`)).toHaveValue("3");
  })

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

  test("Context menu", () => {
    render(<List data={generateDummyContent(10, 1)} />);
    mockAllIsIntersecting(true);
    fireEvent.contextMenu(screen.getByTestId(`0-0`));
    expect(screen.getByText("Cut")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Paste")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`sheet-table-content`));
    expect(screen.queryByText("Cut")).not.toBeInTheDocument();
  });
});
