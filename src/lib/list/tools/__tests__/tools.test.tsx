import React from "react";
import { render, screen, fireEvent, waitFor, getByTestId } from "@testing-library/react";
import { store } from "../../../store";
import { addData, selectOneCell } from "../../../reducer";
import { generateDummyContent } from "../../utils";
import Tools from "../tools";

beforeEach(() => {
  store.dispatch(addData, { payload: generateDummyContent(3, 3) });
});
test("Tools render", async () => {
  const changeStyle = jest.fn();
  const { getByRole, getByTestId } = render(
    <Tools changeStyle={changeStyle} onChange={() => {}} />,
  );
  const bold = getByRole("button", {
    name: /B/i,
  });
  expect(bold).toBeInTheDocument();
  fireEvent.click(bold);
  expect(changeStyle).toHaveBeenLastCalledWith("B");

  const italic = getByRole("button", {
    name: /I/i,
  });
  expect(italic).toBeInTheDocument();
  fireEvent.click(italic);
  expect(changeStyle).toHaveBeenLastCalledWith("I");

  const underline = getByRole("button", {
    name: /U/i,
  });
  fireEvent.click(underline);
  expect(changeStyle).toHaveBeenLastCalledWith("U");
  expect(underline).toBeInTheDocument();

  const fontInput = getByTestId("font-size-input");
  expect(fontInput).toBeInTheDocument();
  fireEvent.change(fontInput, { target: { value: "23" } });
  fireEvent.keyDown(fontInput);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "23"));

  const fontDecrease = getByTestId("font-size-decrease");
  expect(fontDecrease).toBeInTheDocument();
  fireEvent.click(fontDecrease);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "11"));

  const fontIncrease = getByTestId("font-size-increase");
  expect(fontIncrease).toBeInTheDocument();
  fireEvent.click(fontIncrease);
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "13"));

  const left = getByTestId("align-left");
  expect(left).toBeInTheDocument();
  fireEvent.click(left);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-LEFT");

  const center = getByTestId("align-center");
  expect(center).toBeInTheDocument();
  fireEvent.click(center);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-CENTER");

  const right = getByTestId("align-right");
  expect(right).toBeInTheDocument();
  fireEvent.click(right);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-RIGHT");

  const justify = getByTestId("align-justify");
  expect(justify).toBeInTheDocument();
  fireEvent.click(justify);
  expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-JUSTIFY");

  const color = getByTestId("font-color");
  expect(color).toBeInTheDocument();
  fireEvent.click(getByTestId("font-color-button"));
  // await waitFor(() => {
  //   expect(color).toHaveFocus();
  // });
  fireEvent.change(color, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("COLOR", "#ffffff"));

  const background = getByTestId("background-color");
  expect(background).toBeInTheDocument();
  fireEvent.click(getByTestId("background-color-button"));
  fireEvent.change(background, { target: { value: "#ffffff" } });
  await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("BACKGROUND", "#ffffff"));
});

it("should focus calculation input on container click", async () => {
  const changeStyle = jest.fn();
  const { getByTestId, getByText } = render(
    <Tools changeStyle={changeStyle} onChange={() => {}} />,
  );
  expect(getByTestId("fx-input")).toHaveAttribute("readOnly");
  store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  await waitFor(() => {
    expect(getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const container = getByTestId("sheet-tools-calculation-input-container");
  fireEvent.click(container);
  expect(getByTestId("fx-input")).toHaveFocus();
});

it("should call onChange when calculation value changes", async () => {
  const changeStyle = jest.fn();
  const onChange = jest.fn();
  const { getByTestId } = render(<Tools changeStyle={changeStyle} onChange={onChange} />);
  store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  await waitFor(() => {
    expect(getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const input = getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "123" } });
  expect(onChange).toHaveBeenCalled();
});

test("Undo redo", async () => {
  const changeStyle = jest.fn();
  const onChange = jest.fn();
  const { getByTestId } = render(<Tools changeStyle={changeStyle} onChange={onChange} />);
  store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
  await waitFor(() => {
    expect(getByTestId("fx-input")).not.toHaveAttribute("readOnly");
  });
  const input = getByTestId("fx-input");
  fireEvent.change(input, { target: { value: "123" } });
  await waitFor(() => {
    expect(store.getState().data[0][0].value).toBe("123");
  });
  fireEvent.click(getByTestId("undo-button-tools"));
  await waitFor(() => {
    expect(store.getState().data[0][0].value).not.toBe("123");
  });
  fireEvent.click(getByTestId("redo-button-tools"));
  await waitFor(() => {
    expect(store.getState().data[0][0].value).toBe("123");
  });
});
