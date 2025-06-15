import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import Input from "../input";
import { store } from "../../store";
import { addData, changeData } from "../../reducer";
import { generateDummyContent } from "../utils";
import userEvent from "@testing-library/user-event";
let i = 1;
let j = 1;

describe("input tests", () => {
  afterEach(() => {
    cleanup();
  });
  test("input render", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={i} j={j} />);

    expect(screen.getByTestId(`${i}-${j}`)).toBeInTheDocument();
  });
  test("input render value", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const data = store.getState().data;
    render(<Input i={i} j={j} />);
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue(data[i][j].value);
  });

  test("input render calc", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(changeData, { payload: { value: "= 2+2-1", i: i, j: j } });

    render(<Input i={i} j={j} />);
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("3");
  });

  test("input render calc with cell nan", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(changeData, { payload: { value: "= 2+2-1 + A1", i: i, j: j } });

    render(<Input i={i} j={j} />);
    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("NaN");
  });

  test("input render calc with cell", async () => {
    store.dispatch(addData, { payload: generateDummyContent(12, 12) });
    await new Promise((r) => setTimeout(r, 100));

    store.dispatch(changeData, { payload: { value: 5, i: 0, j: 0 } });
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, {
      payload: { value: "= 2+2-1 + ( A1 * 2 ) + ( 2/2 ) ", i: i, j: j },
    });
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, { payload: { value: 5, i: 11, j: 0 } });
    await new Promise((r) => setTimeout(r, 100));
    store.dispatch(changeData, {
      payload: { value: "= 2+2-1 + ( A12 * 2 ) + ( 4/2 ) ", i: i, j: j + 1 },
    });
    await new Promise((r) => setTimeout(r, 100));
    render(
      <>
        <Input i={i} j={j} />
        <Input i={i} j={j + 1} />
      </>,
    );

    expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("14");
    expect(screen.getByTestId(`${i}-${j + 1}`)).toHaveValue("15");
  });

  test("input render change", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });

    render(<Input i={i} j={j} />);
    fireEvent.change(screen.getByTestId(`${i}-${j}`), {
      target: { value: "new value" },
    });
    await waitFor(() => {
      expect(screen.getByTestId(`${i}-${j}`)).toHaveValue("new value");
    });
  });

  test("input check keyboard arrow keys", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(
      <>
        <Input i={i - 1} j={j - 1} />
        <Input i={i - 1} j={j} />
        <Input i={i} j={j - 1} />
        <Input i={i} j={j} />
      </>,
    );
    await user.click(screen.getByTestId(`${i}-${j}`));
    await user.keyboard("{ArrowLeft}");
    // fireEvent.keyDown(screen.getByTestId(`${i}-${j}`), {
    //   code: "ArrowLeft",
    // });
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i}-${j}`));
    await user.keyboard("{ArrowUp}");
    expect(screen.getByTestId(`${i - 1}-${j}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i - 1}-${j - 1}`));
    await user.keyboard("{ArrowDown}");
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i - 1}-${j - 1}`));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByTestId(`${i - 1}-${j}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i - 1}-${j - 1}`));
    expect(screen.getByTestId(`${i - 1}-${j - 1}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i}-${j}`));
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i}-${j - 1}`));
    expect(screen.getByTestId(`${i}-${j}`)).not.toHaveClass("sheet-selected-td");

    await user.dblClick(screen.getByTestId(`${i}-${j}`));
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");

    await user.dblClick(screen.getByTestId(`${i}-${j - 1}`));
    expect(screen.getByTestId(`${i}-${j}`)).not.toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i}-${j}`));
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i}-${j - 1}`));
    expect(screen.getByTestId(`${i}-${j}`)).not.toHaveClass("sheet-selected-td");

    await user.click(screen.getByTestId(`${i - 1}-${j - 1}`));
    expect(screen.getByTestId(`${i - 1}-${j - 1}`)).toHaveClass("sheet-selected-td");

    await user.keyboard("{Meta>}");
    await user.click(screen.getByTestId(`${i}-${j - 1}`));
    await user.click(screen.getByTestId(`${i}-${j}`));
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");
    expect(screen.getByTestId(`${i}-${j - 1}`)).toHaveClass("sheet-selected-td");
    await user.keyboard("{/Meta}");

    fireEvent.mouseMove(screen.getByTestId(`${i}-${j}`), { button: 1, buttons: 1 });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");

    fireEvent.mouseMove(screen.getByTestId(`${i - 1}-${j}`), { button: 1 });
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");
  });

  test("arrow + shift key", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(
      <>
        <Input i={i - 1} j={j - 1} />
        <Input i={i - 1} j={j} />
        <Input i={i} j={j - 1} />
        <Input i={i} j={j} />
      </>,
    );
    await user.click(screen.getByTestId(`${i - 1}-${j}`));
    expect(screen.getByTestId(`${i - 1}-${j - 1}`)).not.toHaveClass("sheet-selected-td");
    await user.keyboard("{Shift>}");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByTestId(`${i - 1}-${j - 1}`)).toHaveClass("sheet-selected-td");
    expect(screen.getByTestId(`${i - 1}-${j}`)).toHaveClass("sheet-selected-td");
    await user.keyboard("{/Shift}");
  });

  test("context menu click", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(
      <>
        <Input i={i - 1} j={j - 1} />
        <Input i={i - 1} j={j} />
        <Input i={i} j={j - 1} />
        <Input i={i} j={j} />
      </>,
    );
    await user.pointer({ keys: "[MouseRight>]", target: screen.getByTestId(`${i}-${j}`) });
    expect(screen.getByTestId(`${i}-${j}`)).not.toHaveClass("sheet-selected-td");
  });
});
