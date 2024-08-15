/* eslint-disable testing-library/no-node-access */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import List from "../index";
import { Provider } from "react-redux";
import { store } from "../../store";
import { generateDummyContent } from "../utils";


test("Table render", async() => {
  render(
    <Provider store={store}>
      <List data={generateDummyContent(310, 1)}/>
    </Provider>
  );
  const data = store.getState().list.data;

  expect(data.length).toBe(310)
  let tr = await screen.findAllByTestId("sheet-table-tr")
  expect(tr).toHaveLength(300)
  await fireEvent.scroll(screen.getByTestId(`sheet-table`), {target: {scrollTo: 300 * 28}});
});

test("Table KeyboardActions", async () => {
  render(
    <Provider store={store}>
      <List data={generateDummyContent(10, 1)} />
    </Provider>,
  );
  const table = screen.getByTestId(`sheet-table`);
  fireEvent.keyDown(table, { code: "KeyA", ctrlKey: true });
  await waitFor(() => {expect(store.getState().list.selected).toHaveLength(10)})

  fireEvent.keyDown(table, { code: "Backspace"});
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
