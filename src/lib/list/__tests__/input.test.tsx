import React, { Fragment } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Input from "../input";
import { store } from "../../store";
import { addData, changeData } from "../../reducer";
import { generateDummyContent } from "../utils";

let i = 1;
let j = 1;
describe("input tests", () => {
  test("input render", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(
        <Input i={i} j={j} />
    );

    expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
  });
  test("input render value", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const data = store.getState().data;
    render(
        <Input i={i} j={j} />
    );
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue(data[i][j].value);
  });

  test("input render calc", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(changeData, {payload: { value: "= 2+2-1", i: i, j: j }});

    render(
        <Input i={i} j={j} />
    );
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("3");
  });

  test("input render calc with cell nan", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(changeData, {payload:  { value: "= 2+2-1 + A1", i: i, j: j }});

    render(
        <Input i={i} j={j} />
    );
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("NaN");
  });

  test("input render calc with cell", async () => {
    store.dispatch(addData, {payload: generateDummyContent(12, 12)});
    await new Promise((r) => setTimeout(r, 100));

    store.dispatch(changeData, {payload: { value: 5, i: 0, j: 0 }});
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, {payload: { value: "= 2+2-1 + ( A1 * 2 ) + ( 2/2 ) ", i: i, j: j }});
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, {payload: { value: 5, i: 11, j: 0 }});
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, {payload: { value: "= 2+2-1 + ( A12 * 2 ) + ( 4/2 ) ", i: i, j: j + 1 }});
    await new Promise((r) => setTimeout(r, 100));
    render(
      <>
        <Input i={i} j={j} />
        <Input i={i} j={j + 1} />
      </>
    );

    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("14");
    expect(screen.getByTestId(`${i}-${j + 1}`)).toHaveValue("15");
  });

  test("input render change", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });

    render(
        <Input i={i} j={j} />
    );
    fireEvent.change(screen.getByTestId(`${i}-${j}`), {
      target: { value: "new value" },
    });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("new value");
  });

  test("input check keyboard arrow keys", async () => {
      store.dispatch(addData, { payload: generateDummyContent(3, 3) });

    render(
      <>
        <Input i={i - 1} j={j - 1} />
        <Input i={i - 1} j={j} />
        <Input i={i} j={j - 1} />
        <Input i={i} j={j} />
      </>,
    );

    fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
      code: "ArrowLeft",
    });
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
      code: "ArrowUp",
    });
    expect(screen.getByTestId(`${i - 1}-${j}`)).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId(`${i - 1}-${j - 1}`), {
      code: "ArrowDown",
    });
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveFocus();

    fireEvent.keyDown(screen.getByTestId(`${i}-${j - 1}`), {
      code: "ArrowRight",
    });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();

    fireEvent.click(screen.getByTestId(`${i}-${j}`), {});
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();
    fireEvent.doubleClick(screen.getByTestId(`${i}-${j}`), {});
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();

    fireEvent.mouseDown(screen.getByTestId(`${i}-${j}`), {});
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();

    fireEvent.mouseDown(screen.getByTestId(`${i}-${j}`), { ctrlKey: true });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();

    fireEvent.mouseMove(screen.getByTestId(`${i}-${j}`), { button: 1, buttons: 1 });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();

    fireEvent.mouseMove(screen.getByTestId(`${i - 1}-${j}`), { button: 1, buttons: 1 });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveFocus();
  });

  test("input check keyboard arrow keys with shift key", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });

    const { container } = render(
      <>
        <Input i={i - 1} j={j - 1} />
        <Input i={i - 1} j={j} />
        <Input i={i} j={j - 1} />
        <Input i={i} j={j} />
      </>,
    );

    fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
      code: "ArrowLeft",
      shiftKey: true,
    });
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveFocus();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName("sheet-selected-td")).toHaveLength(2);
  });
});