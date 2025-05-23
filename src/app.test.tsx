import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import App from "./App";
import packageVersion from "../package.json";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

test("App Name rendered", async () => {
  const { findByText } = render(<App count={4} />);
  expect(await findByText(/React excel sheet/i)).toBeInTheDocument();
});

test("App version match check", async () => {
  const { findByText } = render(<App count={4} />);
  expect(await findByText(new RegExp(packageVersion.version, "i"))).toBeInTheDocument();
});

test("Get Updated data option", async () => {
  const { findByText } = render(<App count={4} />);
  expect(await findByText(/Get Updated data/i)).toBeInTheDocument();
});

test("Get Updated data in console", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const { getByTestId } = render(<App count={4} />);
  fireEvent.click(getByTestId("get-updated-data"));
  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalled();
  });
});

test("data change in in console", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  const { getByTestId } = render(<App count={2} />);
  mockAllIsIntersecting(true);
  await waitFor(() => getByTestId("1-1"));
  fireEvent.change(getByTestId("1-1"), {
    target: { value: "new value" },
  });
  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalled();
  });
});

test("Csv export", async () => {
  const { getByTestId } = render(<App count={4} />);
  const createElementSpy = jest.spyOn(document, "createElement");
  fireEvent.click(getByTestId("csv-export"));
  await waitFor(() => {
    expect(createElementSpy).toBeCalledWith("A");
  });
});