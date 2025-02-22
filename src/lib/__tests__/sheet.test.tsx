import React, { createRef } from "react";
import { render } from "@testing-library/react";
import Sheet, { SheetRef } from "../lib";
import { store } from "../store";

test("ref functions test", () => {
  const ref = createRef<SheetRef>();
  render(<Sheet ref={ref} data={[[2, "= 2 + 2"]]} />);
  const createElementSpy = jest.spyOn(document, "createElement");
  ref?.current?.exportCsv("dummy");
  expect(createElementSpy).toBeCalledWith("A");
  ref?.current?.setData([[2], [2]]);
  expect(store.getState().data.length).toEqual(2);
});
