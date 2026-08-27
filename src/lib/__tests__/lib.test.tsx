import React, { act, createRef } from "react";
import { render } from "@testing-library/react";
import Sheet from "../lib";

beforeAll(() => {
  HTMLAnchorElement.prototype.click = vi.fn() as any;
});

describe("Sheet imperative API", () => {
  it("getData, setData, exportCsv work", () => {
    const ref = createRef<any>();
    const { rerender } = render(<Sheet data={[[{ value: "a" }]]} ref={ref} />);
    // getData returns initial state
    expect(ref.current.getData()).toBeDefined();

    // setData updates store
    act(() => {
      ref.current.setData([[{ value: "x" }]]);
    });
    expect(ref.current.getData()[0][0].value).toBe("x");

    // exportCsv does not throw
    expect(() => ref.current.exportCsv("test")).not.toThrow();
    rerender(<Sheet data={[[{ value: "b" }]]} ref={ref} />);
  });

  it("exportCsv including headers", () => {
    const ref = createRef<any>();
    const { rerender } = render(<Sheet data={[[{ value: "a" }]]} ref={ref} />);
    // getData returns initial state
    expect(ref.current.getData()).toBeDefined();

    // setData updates store
    act(() => {
      ref.current.setData([[{ value: "x" }]]);
    });
    expect(ref.current.getData()[0][0].value).toBe("x");

    // exportCsv does not throw
    expect(() => ref.current.exportCsv("test", true)).not.toThrow();
    rerender(<Sheet data={[[{ value: "b" }]]} ref={ref} />);
  });
});

describe("Sheet imperative API — getOneCell / updateOneCell", () => {
  it("getOneCell returns the cell at the given coordinates", () => {
    const ref = createRef<any>();
    render(<Sheet data={[[{ value: "hello" }, { value: "world" }]]} ref={ref} />);
    act(() => {
      ref.current.setData([[{ value: "foo" }, { value: "bar" }]]);
    });
    const cell = ref.current.getOneCell(0, 1);
    expect(cell.value).toBe("bar");
  });

  it("updateOneCell correctly updates a cell in the store", () => {
    const ref = createRef<any>();
    render(<Sheet data={[[{ value: "a" }, { value: "b" }]]} ref={ref} />);
    act(() => {
      ref.current.setData([[{ value: "x" }, { value: "y" }]]);
    });
    act(() => {
      ref.current.updateOneCell(0, 1, "updated");
    });
    expect(ref.current.getData()[0][1].value).toBe("updated");
  });
});
