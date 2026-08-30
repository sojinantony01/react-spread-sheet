import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { store } from "../../../store";
import { addData, clearSelection, selectCellsDrag, selectOneCell } from "../../../reducer";
import { generateDummyContent } from "../../utils";
import Tools from "../tools";

beforeEach(() => {
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  });
});

test("Tools render", async () => {
  const changeStyle = vi.fn();
  render(<Tools changeStyle={changeStyle} onChange={() => {}} />);
  const bold = screen.getByRole("button", {
    name: /B/i,
  });
  expect(bold).toBeInTheDocument();
  fireEvent.click(bold);
  expect(changeStyle).toHaveBeenLastCalledWith("B");

  const italic = screen.getByRole("button", {
    name: /I/i,
  });
  expect(italic).toBeInTheDocument();
  fireEvent.click(italic);
  expect(changeStyle).toHaveBeenLastCalledWith("I");

  const underline = screen.getByRole("button", {
    name: /U/i,
  });
  fireEvent.click(underline);
  expect(changeStyle).toHaveBeenLastCalledWith("U");
  expect(underline).toBeInTheDocument();

  const fontInput = screen.getByTestId("font-size-input");
  expect(fontInput).toBeInTheDocument();
  fireEvent.change(fontInput, { target: { value: "23" } });
  fireEvent.keyDown(fontInput);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "23"));

  const fontDecrease = screen.getByTestId("font-size-decrease");
  expect(fontDecrease).toBeInTheDocument();
  fireEvent.click(fontDecrease);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "11"));

  const fontIncrease = screen.getByTestId("font-size-increase");
  expect(fontIncrease).toBeInTheDocument();
  fireEvent.click(fontIncrease);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "13"));

  const left = screen.getByTestId("align-left");
  expect(left).toBeInTheDocument();
  fireEvent.click(left);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-LEFT");

  const center = screen.getByTestId("align-center");
  expect(center).toBeInTheDocument();
  fireEvent.click(center);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-CENTER");

  const right = screen.getByTestId("align-right");
  expect(right).toBeInTheDocument();
  fireEvent.click(right);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-RIGHT");

  const justify = screen.getByTestId("align-justify");
  expect(justify).toBeInTheDocument();
  fireEvent.click(justify);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-JUSTIFY");

  const color = screen.getByTestId("font-color");
  expect(color).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("font-color-button"));
  fireEvent.change(color, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("COLOR", "#ffffff"));

  const background = screen.getByTestId("background-color");
  expect(background).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("background-color-button"));
  fireEvent.change(background, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("BACKGROUND", "#ffffff"));
});

it("should focus calculation input on container click", async () => {
  const changeStyle = vi.fn();
  render(<Tools changeStyle={changeStyle} onChange={() => {}} />);
  expect(screen.getByTestId("fx-input")).toHaveAttribute("readOnly");
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });

  await waitFor(() => {
    expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const container = screen.getByTestId("sheet-tools-calculation-input-container");
  fireEvent.click(container);
  expect(screen.getByTestId("fx-input")).toHaveFocus();
});

it("should call onChange when calculation value changes", async () => {
  const changeStyle = vi.fn();
  const onChange = vi.fn();
  render(<Tools changeStyle={changeStyle} onChange={onChange} />);
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });

  await waitFor(() => {
    expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "123" } });
  expect(onChange).toHaveBeenCalled();
});

test("Undo redo", async () => {
  const changeStyle = vi.fn();
  const onChange = vi.fn();
  render(<Tools changeStyle={changeStyle} onChange={onChange} />);
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });

  await waitFor(() => {
    expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "123" } });
  await waitFor(() => {
    expect(store.getState().data[0][0].value).toBe("123");
  });
  expect(onChange).toHaveBeenCalled();
  fireEvent.click(screen.getByTestId("undo-button-tools"));
  await waitFor(() => {
    expect(store.getState().data[0][0].value).not.toBe("123");
  });
  expect(onChange).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByTestId("redo-button-tools"));
  await waitFor(() => {
    expect(store.getState().data[0][0].value).toBe("123");
  });
  expect(onChange).toHaveBeenCalledTimes(3);
});

test("merge cells tools", async () => {
  const changeStyle = vi.fn();
  const onChange = vi.fn();
  render(<Tools changeStyle={changeStyle} onChange={onChange} />);
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  act(() => {
    store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
  });

  await waitFor(() => {
    expect(store.getState().selected.length).toBe(4);
  });
  fireEvent.click(screen.getByTestId(`merge`));
  expect(store.getState().selected.length).toBe(1);
  expect(store.getState().data[0][0].rowSpan).toBe(2);
  expect(store.getState().data[0][0].colSpan).toBe(2);
});

test("sigma button opens formula menu and inserts SUM formula for a selection", async () => {
  const onChange = vi.fn();
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectCellsDrag, { payload: { i: 1, j: 0 } });
  });

  await waitFor(() => expect(store.getState().selected.length).toBe(2));

  const sigmaBtn = screen.getByTestId("formula-sigma-btn");
  expect(sigmaBtn).not.toBeDisabled();
  fireEvent.click(sigmaBtn);

  expect(screen.getByTestId("formula-toolbar-menu")).toBeInTheDocument();

  fireEvent.click(screen.getByText("SUM"));

  await waitFor(() => {
    const data = store.getState().data;
    const val = data[2][0]?.value as string;
    expect(val).toMatch(/^=SUM/);
  });
  expect(onChange).toHaveBeenCalled();
});

test("sigma button inserts a single-cell formula (ABS)", async () => {
  const onChange = vi.fn();
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(5, 3) });
    store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  await waitFor(() => expect(store.getState().selected.length).toBe(1));

  fireEvent.click(screen.getByTestId("formula-sigma-btn"));
  fireEvent.click(screen.getByText("ABS"));

  await waitFor(() => {
    const val = store.getState().data[1][0]?.value as string;
    expect(val).toMatch(/^=ABS/);
  });
});

test("sigma button is disabled when no cell is selected", () => {
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    // addData resets undo/redo but not selected; clear it explicitly
    store.dispatch(clearSelection);
  });
  render(<Tools changeStyle={vi.fn()} onChange={vi.fn()} />);
  expect(screen.getByTestId("formula-sigma-btn")).toBeDisabled();
});

test("sigma menu closes when clicking outside", async () => {
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(
    <div data-testid="outside">
      <Tools changeStyle={vi.fn()} onChange={vi.fn()} />
    </div>,
  );

  await waitFor(() => expect(store.getState().selected.length).toBe(1));
  fireEvent.click(screen.getByTestId("formula-sigma-btn"));
  expect(screen.getByTestId("formula-toolbar-menu")).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByTestId("outside"));
  await waitFor(() => {
    expect(screen.queryByTestId("formula-toolbar-menu")).not.toBeInTheDocument();
  });
});

test("fx bar shows formula suggestions when user types a matching prefix", async () => {
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={vi.fn()} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=SU" } });

  await waitFor(() => {
    expect(screen.getByTestId("formula-suggestions")).toBeInTheDocument();
    expect(screen.getByText("SUM")).toBeInTheDocument();
  });
});

test("fx bar suggestion can be selected with ArrowDown + Enter", async () => {
  const onChange = vi.fn();
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=SU" } });

  await waitFor(() => expect(screen.getByTestId("formula-suggestions")).toBeInTheDocument());

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => {
    const val = store.getState().data[0][0].value as string;
    expect(val).toMatch(/^=SUM/);
  });
});

test("fx bar suggestion dismissed with Escape", async () => {
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={vi.fn()} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=SU" } });
  await waitFor(() => expect(screen.getByTestId("formula-suggestions")).toBeInTheDocument());

  fireEvent.keyDown(input, { key: "Escape" });
  await waitFor(() => {
    expect(screen.queryByTestId("formula-suggestions")).not.toBeInTheDocument();
  });
});

test("fx bar suggestion can be selected with ArrowUp + Tab", async () => {
  const onChange = vi.fn();
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  // Typing "=S" should show SUM and SQRT
  fireEvent.change(input, { target: { value: "=S" } });

  await waitFor(() => expect(screen.getByTestId("formula-suggestions")).toBeInTheDocument());

  // Navigate down to index 0 then up (stays at 0)
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "Tab" });

  await waitFor(() => {
    const val = store.getState().data[0][0].value as string;
    expect(val).toMatch(/^=/);
  });
});

test("fx bar clears suggestions when non-formula value is typed", async () => {
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={vi.fn()} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=SU" } });
  await waitFor(() => expect(screen.queryByTestId("formula-suggestions")).toBeInTheDocument());

  fireEvent.change(input, { target: { value: "hello" } });
  await waitFor(() => {
    expect(screen.queryByTestId("formula-suggestions")).not.toBeInTheDocument();
  });
});

test("fx onBlur clears formula highlights", async () => {
  act(() => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={vi.fn()} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=A1" } });
  fireEvent.blur(input);
  // After blur, suggestion list should eventually be cleared
  await waitFor(() => {
    expect(screen.queryByTestId("formula-suggestions")).not.toBeInTheDocument();
  });
});

test("sigma inserts SUM formula when a single cell at row 0 is selected", async () => {
  const onChange = vi.fn();
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(5, 3) });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  await waitFor(() => expect(store.getState().selected.length).toBe(1));

  fireEvent.click(screen.getByTestId("formula-sigma-btn"));
  fireEvent.click(screen.getByText("SUM"));

  await waitFor(() => {
    const val = store.getState().data[0][0]?.value as string;
    expect(val).toMatch(/^=SUM/);
  });
});

test("fx bar suggestion can be selected by clicking (mouseDown)", async () => {
  const onChange = vi.fn();
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  });
  render(<Tools changeStyle={vi.fn()} onChange={onChange} />);

  await waitFor(() => expect(screen.getByTestId("fx-input")).not.toHaveAttribute("readOnly"));

  const input = screen.getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "=SU" } });

  await waitFor(() => expect(screen.getByTestId("formula-suggestions")).toBeInTheDocument());

  // Click (mouseDown) the first suggestion item
  const firstSuggestion = screen.getByText("SUM").closest("li")!;
  fireEvent.mouseDown(firstSuggestion);

  await waitFor(() => {
    const val = store.getState().data[0][0].value as string;
    expect(val).toMatch(/^=SUM/);
  });
});

