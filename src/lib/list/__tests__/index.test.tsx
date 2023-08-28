import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
