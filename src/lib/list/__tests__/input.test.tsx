import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../input";
import { Provider } from "react-redux";
import { store } from "../../store";
import { addData, changeData } from "../../reducer";
import { generateDummyContent } from "../utils";

let i = 1;
let j = 1;
test("input render", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );

  expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
});
test("input render value", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  const data = store.getState().list.data;
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue(data[i][j].value);
});

test("input render calc", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  store.dispatch(changeData({ value: "= 2+2-1", i: i, j: j }))
  
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("3");
});

test("input render calc with cell nan", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  store.dispatch(changeData({ value: "= 2+2-1 + A1", i: i, j: j }))
  
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("NaN");
});


test("input render calc with cell",async () => {
  store.dispatch(addData(generateDummyContent(12, 12))); 
  await new Promise((r) => setTimeout(r, 100));
 
  store.dispatch(changeData({ value: 5, i: 0, j: 0 }))
  await new Promise((r) => setTimeout(r, 100));
  store.dispatch(changeData({ value: "= 2+2-1 + ( A1 * 2 ) + ( 2/2 ) ", i: i, j: j }))
  await new Promise((r) => setTimeout(r, 100));
  store.dispatch(changeData({ value: 5, i: 11, j: 0 }))
  await new Promise((r) => setTimeout(r, 100));
  store.dispatch(changeData({ value: "= 2+2-1 + ( A12 * 2 ) + ( 4/2 ) ", i: i, j: j + 1 }))
  await new Promise((r) => setTimeout(r, 100));
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
      <Input i={i} j={j+1} />
    </Provider>
  );

  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("14");
  expect(screen.getByTestId(`${i}-${j+1}`)).toHaveValue("15");

});

test("input render change", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  
  render(
    <Provider store={store}>
      <Input i={i} j={j} />
    </Provider>
  );
  fireEvent.change(screen.getByTestId(`${i}-${j}`), {
    target: { value: "new value" }
  });
  expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("new value")
});

test("input check keyboard arrow keys", () => {
  store.dispatch(addData(generateDummyContent(3, 3)));
  
  render(
    <Provider store={store}>
      <Input i={i} j={j-1} />
      <Input i={i} j={j} />
      <Input i={i} j={j+1} />
      <Input i={i-1} j={j} />
      <Input i={i+1} j={j} />
    </Provider>
  );
  fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
    keyCode: 37
  });
  expect(screen.getByTestId(`${i}-${j-1}`)).toHaveFocus()

  fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
    keyCode: 38
  });
  expect(screen.getByTestId(`${i-1}-${j}`)).toHaveFocus()

  fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
    keyCode: 39
  });
  expect(screen.getByTestId(`${i}-${j+1}`)).toHaveFocus()

  fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
    keyCode: 40
  });
  expect(screen.getByTestId(`${i+1}-${j}`)).toHaveFocus()

  fireEvent.click(screen.getByTestId(`${i}-${j}`), {});
  expect(screen.getByTestId(`${i+1}-${j}`)).toHaveFocus()
  fireEvent.doubleClick(screen.getByTestId(`${i}-${j}`), {});
  expect(screen.getByTestId(`${i+1}-${j}`)).toHaveFocus()
});


