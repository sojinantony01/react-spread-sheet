/* eslint-disable testing-library/no-node-access */
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import List from "../index";
import { Provider } from "react-redux";
import { store } from "../../store";
import { generateDummyContent } from "../utils";
import { changeData } from "../../reducer";

describe("index tests", () => {
  afterEach(()=> {
    cleanup()
  })
  test("Table render", async () => {
    render(
      <Provider store={store}>
        <List data={generateDummyContent(310, 1)} />
      </Provider>,
    );
    const data = store.getState().list.data;

    expect(data.length).toBe(310);
    let tr = await screen.findAllByTestId("sheet-table-tr");
    expect(tr).toHaveLength(300);
    fireEvent.scroll(screen.getByTestId(`sheet-table-content`), { target: { scrollTo: 300 * 28 } });
    //FIXME: assert new rows based index
  });

  test("Table KeyboardActions", async () => {
    render(
      <Provider store={store}>
        <List data={generateDummyContent(10, 1)} />
      </Provider>,
    );
    const table = screen.getByTestId(`sheet-table`);
    fireEvent.keyDown(table, { code: "KeyA", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.selected).toHaveLength(10);
    });

    fireEvent.keyDown(table, { code: "Backspace" });
    await waitFor(() => {
      expect(store.getState().list.data[0][0].value).toBe("");
    });

    fireEvent.keyDown(table, { code: "KeyB", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });

    fireEvent.keyDown(table, { code: "KeyU", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["text-decoration"]).toBe("underline");
    });

    fireEvent.keyDown(table, { code: "KeyI", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["fontStyle"]).toBe("italic");
    });
  });

  test("Undo-Redo", async () => {
    render(
      <Provider store={store}>
        <List data={generateDummyContent(10, 1)} />
      </Provider>,
    );
    const table = screen.getByTestId(`sheet-table`);

    fireEvent.keyDown(table, { code: "KeyB", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });

    //undo
    fireEvent.keyDown(table, { code: "KeyZ", ctrlKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["fontWeight"]).toBe(undefined);
    });

    fireEvent.keyDown(table, { code: "KeyZ", ctrlKey: true, shiftKey: true });
    await waitFor(() => {
      expect(store.getState().list.data?.[0][0]?.styles?.["fontWeight"]).toBe("bold");
    });
  });
})
