import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import packageVersion from "../package.json";
import { mockAllIsIntersecting } from "react-intersection-observer/test-utils";

test("App Name rendered", () => {
  render(<App count={4} />);
  const linkElement = screen.getByText(/React excel sheet/i);
  expect(linkElement).toBeInTheDocument();
});

test("App version match check", () => {
  render(<App count={4} />);
  const linkElement = screen.getByText(new RegExp(packageVersion.version, "i"));
  expect(linkElement).toBeInTheDocument();
});
test("Get Updated data option", () => {
  render(<App count={4} />);
  const linkElement = screen.getByText(/Get Updated data/i);
  expect(linkElement).toBeInTheDocument();
});

test("Get Updated data in console", () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  render(<App count={4} />);
  fireEvent.click(screen.getByTestId("get-updated-data"));
  expect(consoleSpy).toHaveBeenCalled();
});

test("data change in in console", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  render(<App count={2} />);
  mockAllIsIntersecting(true);
  await new Promise((r) => setTimeout(r, 100));
  fireEvent.change(screen.getByTestId(`${1}-${1}`), {
    target: { value: "new value" },
  });
  expect(consoleSpy).toHaveBeenCalled();
});

test("Csv export", () => {
  render(<App count={4} />);
  const createElementSpy = jest.spyOn(document, "createElement");
  fireEvent.click(screen.getByTestId("csv-export"));
  expect(createElementSpy).toBeCalledWith("A");
});
