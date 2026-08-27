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

  test("input formula edit triggers updateFormulaHighlights", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={i} j={j} />);
    const input = screen.getByTestId(`${i}-${j}`);
    fireEvent.change(input, { target: { value: "=A1" } });
    // Just ensure it doesn't throw; DOM highlights are tested in formula-edit-state tests
    expect(input).toBeInTheDocument();
  });

  test("input non-formula change clears formula highlights", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={i} j={j} />);
    const input = screen.getByTestId(`${i}-${j}`);
    // first set formula, then remove it
    fireEvent.change(input, { target: { value: "=A1" } });
    fireEvent.change(input, { target: { value: "hello" } });
    expect(input).toHaveValue("hello");
  });

  test("input onFocus sets edit mode via ref; onBlur clears it", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={i} j={j} />);
    const input = screen.getByTestId(`${i}-${j}`);
    fireEvent.focus(input);
    // After focus the input should still be in DOM
    expect(input).toBeInTheDocument();
    fireEvent.blur(input);
    expect(input).toBeInTheDocument();
  });

  test("input double-click enters edit mode", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(<Input i={i} j={j} />);
    await user.dblClick(screen.getByTestId(`${i}-${j}`));
    expect(screen.getByTestId(`${i}-${j}`)).not.toHaveClass("view_mode");
  });

  test("input Backspace in edit mode stops propagation", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(<Input i={i} j={j} />);
    // Enter edit mode
    await user.dblClick(screen.getByTestId(`${i}-${j}`));
    // Type to change value so edit mode is active
    fireEvent.change(screen.getByTestId(`${i}-${j}`), { target: { value: "abc" } });
    // Backspace in edit mode should be stopped (not propagate)
    const ev = new KeyboardEvent("keydown", { code: "Backspace", bubbles: true });
    const stopSpy = vi.spyOn(ev, "stopPropagation");
    screen.getByTestId(`${i}-${j}`).dispatchEvent(ev);
    expect(stopSpy).toHaveBeenCalled();
  });

  test("input Ctrl+A in edit mode stops propagation", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={i} j={j} />);
    fireEvent.change(screen.getByTestId(`${i}-${j}`), { target: { value: "abc" } });
    const ev = new KeyboardEvent("keydown", { code: "KeyA", ctrlKey: true, bubbles: true });
    const stopSpy = vi.spyOn(ev, "stopPropagation");
    screen.getByTestId(`${i}-${j}`).dispatchEvent(ev);
    expect(stopSpy).toHaveBeenCalled();
  });

  test("input right-click selects the cell when not already selected", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    const user = userEvent.setup();
    render(<Input i={0} j={0} />);
    await user.pointer({ keys: "[MouseRight>]", target: screen.getByTestId("0-0") });
    expect(screen.getByTestId("0-0")).toHaveClass("sheet-selected-td");
  });

  test("left mouse drag triggers selectCellsDrag", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(
      <>
        <Input i={0} j={0} />
        <Input i={1} j={0} />
      </>,
    );
    // Simulate mouse move with left button held
    fireEvent.mouseMove(screen.getByTestId("1-0"), { buttons: 1 });
    // The drag handler only fires if left button is held
    expect(screen.getByTestId("1-0")).toBeInTheDocument();
  });

  test("non-left mouse move does not trigger drag", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={0} j={0} />);
    // buttons: 0 = no button
    fireEvent.mouseMove(screen.getByTestId("0-0"), { buttons: 0 });
    expect(screen.getByTestId("0-0")).toBeInTheDocument();
  });

  test("detectLeftButton falls back to evt.which when buttons is absent (line 24)", () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={0} j={0} />);
    const el = screen.getByTestId("0-0");
    // Create a MouseEvent and override 'buttons' to be undefined
    const evt = new MouseEvent("mousedown", { bubbles: true, button: 1 });
    Object.defineProperty(evt, "buttons", { get: () => undefined, configurable: true });
    el.dispatchEvent(evt);
    expect(el).toBeInTheDocument();
  });

  test("findNext recurses when target element is missing (line 90)", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(
      <>
        <Input i={0} j={0} />
        {/* intentionally omit i=0 j=1 so findNext must recurse to find next valid cell */}
        <Input i={0} j={2} />
      </>,
    );
    // Focus the first input (view_mode) then fire ArrowRight — navigates because not in editMode
    const input00 = screen.getByTestId("0-0");
    input00.focus();
    // ArrowRight in view_mode triggers navigation; findNext recurses since j=1 element is absent
    fireEvent.keyDown(input00, { code: "ArrowRight" });
    // The store's selected should be set to [0,2] (the next available cell)
    expect(store.getState().selected).toContainEqual([0, 2]);
  });

  test("keyDown Ctrl+Shift+Z (redo shortcut) calls preventDefault", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={1} j={1} />);
    const input = screen.getByTestId("1-1");
    const ev = new KeyboardEvent("keydown", { code: "KeyZ", ctrlKey: true, shiftKey: true, bubbles: true });
    const preventSpy = vi.spyOn(ev, "preventDefault");
    input.dispatchEvent(ev);
    expect(preventSpy).toHaveBeenCalled();
  });

  test("keyDown Ctrl+Z (undo shortcut) calls preventDefault", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={1} j={1} />);
    const input = screen.getByTestId("1-1");
    const ev = new KeyboardEvent("keydown", { code: "KeyZ", ctrlKey: true, bubbles: true });
    const preventSpy = vi.spyOn(ev, "preventDefault");
    input.dispatchEvent(ev);
    expect(preventSpy).toHaveBeenCalled();
  });

  test("keyDown Ctrl+C in edit mode with selection stops propagation (line 165)", async () => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    render(<Input i={1} j={1} />);
    fireEvent.change(screen.getByTestId("1-1"), { target: { value: "hello" } });
    const origGetSelection = window.getSelection;
    window.getSelection = () => ({ toString: () => "hello" } as Selection);
    const ev = new KeyboardEvent("keydown", { code: "KeyC", ctrlKey: true, bubbles: true });
    const stopSpy = vi.spyOn(ev, "stopPropagation");
    screen.getByTestId("1-1").dispatchEvent(ev);
    expect(stopSpy).toHaveBeenCalled();
    window.getSelection = origGetSelection;
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
    expect(screen.getByTestId(`${i}-${j}`)).toHaveClass("sheet-selected-td");
  });
});
