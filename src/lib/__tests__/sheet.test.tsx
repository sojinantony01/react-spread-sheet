import React, { act, createRef } from "react";
import { render, waitFor } from "@testing-library/react";
import Sheet, { SheetRef } from "../lib";
import { store } from "../store";
import "@testing-library/jest-dom";

beforeAll(() => {
  HTMLAnchorElement.prototype.click = vi.fn() as any;
});

test("ref functions test", async () => {
  const ref = createRef<SheetRef>();
  render(<Sheet ref={ref} data={[[{ value: "= 2 + 2" }]]} />);
  const createElementSpy = vi.spyOn(document, "createElement");
  ref?.current?.exportCsv("dummy");
  expect(createElementSpy).toBeCalledWith("A");
  act(() => {
    ref?.current?.setData([[{ value: "2" }], [{ value: "2" }]]);
  });
  await waitFor(() => expect(store.getState().data.length).toEqual(2));
});
