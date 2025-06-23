import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import ContextMenu from "../context-menu";

describe("ContextMenu", () => {
  const mockProps = {
    x: 100,
    y: 200,
    onClose: jest.fn(),
    copyToClipBoard: jest.fn(),
    cutItemsToClipBoard: jest.fn(),
    pasteFromClipBoard: jest.fn(),
    changeInputType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(cleanup);

  test("renders context menu with correct position", () => {
    render(<ContextMenu {...mockProps} />);

    const contextMenu = screen.getByRole("menu");
    expect(contextMenu).toHaveStyle({
      position: "fixed",
      left: "100px",
      top: "200px",
    });
  });

  test("renders all menu items", () => {
    render(<ContextMenu {...mockProps} />);

    expect(screen.getByText("Cut")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Paste")).toBeInTheDocument();
    expect(screen.getByText("Input Type")).toBeInTheDocument();
  });

  test("handles cut action correctly", () => {
    render(<ContextMenu {...mockProps} />);

    fireEvent.click(screen.getByText("Cut"));

    expect(mockProps.cutItemsToClipBoard).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("handles copy action correctly", () => {
    render(<ContextMenu {...mockProps} />);

    fireEvent.click(screen.getByText("Copy"));

    expect(mockProps.copyToClipBoard).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("handles paste action correctly", () => {
    render(<ContextMenu {...mockProps} />);

    fireEvent.click(screen.getByText("Paste"));

    expect(mockProps.pasteFromClipBoard).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("shows input type submenu on hover", () => {
    render(<ContextMenu {...mockProps} />);

    const inputTypeItem = screen.getByText("Input Type");
    fireEvent.mouseEnter(inputTypeItem);

    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Number")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Select Box")).toBeInTheDocument();
    expect(screen.getByText("Checkbox")).toBeInTheDocument();
    expect(screen.getByText("Radio Button")).toBeInTheDocument();
    expect(screen.getByText("Text Area")).toBeInTheDocument();
  });

  test("handles input type selection correctly", () => {
    render(<ContextMenu {...mockProps} />);

    const inputTypeItem = screen.getByText("Input Type");
    fireEvent.mouseEnter(inputTypeItem);

    fireEvent.click(screen.getByText("Date"));

    expect(mockProps.changeInputType).toHaveBeenCalledWith("date");
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("menu items have correct classes", () => {
    render(<ContextMenu {...mockProps} />);

    const menuItems = screen.getAllByRole("menuitem");
    menuItems.forEach((item) => {
      expect(item).toHaveClass("sheet-context-menu-item");
    });

    expect(screen.getByRole("menu")).toHaveClass("sheet-context-menu");
  });

  test("Close on outside click", () => {
    render(
      <div data-testid="parent">
        <ContextMenu {...mockProps} />
      </div>,
    );

    fireEvent.click(screen.getByTestId("parent"));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test("menu items are clickable", () => {
    render(<ContextMenu {...mockProps} />);

    const menuItems = screen.getAllByRole("menuitem");
    menuItems.forEach((item) => {
      expect(item).not.toBeDisabled();
    });
  });
});
