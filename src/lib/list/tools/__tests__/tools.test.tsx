import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { store } from "../../../store";
import { addData, selectCellsDrag, selectOneCell } from "../../../reducer";
import { generateDummyContent } from "../../utils";
import Tools from "../tools";

beforeEach(() => {
  act(() => {
    store.dispatch(addData, { payload: generateDummyContent(3, 3) });
  });
});
test("Tools render", async () => {
  const changeStyle = jest.fn();
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
  // await waitFor(() => {
  //   expect(color).toHaveFocus();
  // });
  fireEvent.change(color, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("COLOR", "#ffffff"));

  const background = screen.getByTestId("background-color");
  expect(background).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("background-color-button"));
  fireEvent.change(background, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("BACKGROUND", "#ffffff"));
});

it("should focus calculation input on container click", async () => {
  const changeStyle = jest.fn();
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
  const changeStyle = jest.fn();
  const onChange = jest.fn();
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
  const changeStyle = jest.fn();
  const onChange = jest.fn();
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
  expect(onChange).toHaveBeenCalled();
  expect(onChange).toHaveBeenCalledTimes(3);
});

test("merge cells tools", async () => {
  const changeStyle = jest.fn();
  const onChange = jest.fn();
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
