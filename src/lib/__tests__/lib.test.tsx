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
