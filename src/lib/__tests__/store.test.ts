import { store } from "../store";
import {
  initialState,
  addData,
  selectCells,
  selectOneCell,
  selectVerticalCells,
  selectHorizontalCells,
  selectCellsDrag,
  clearSelection,
  updateInputTypes,
  undo,
  redo,
} from "../reducer";

describe("store", () => {
  it("should get initial state", () => {
    expect(store.getState()).toEqual(initialState);
  });

  it("should update state and notify subscribers", () => {
    const callback = vi.fn();
    const unsubscribe = store.subscribe(callback);

    store.dispatch(addData, { payload: [[{ value: 1 }]] });
    expect(store.getState().data[0][0].value).toBe(1);
    expect(callback).toHaveBeenCalled();

    unsubscribe();
    store.dispatch(addData, { payload: [[{ value: 2 }]] });
    // callback should not be called again after unsubscribe
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("reducer", () => {
  beforeEach(() => {
    store.dispatch(addData, {
      payload: [
        [{ value: "a" }, { value: "b" }, { value: "c" }],
        [{ value: "d" }, { value: "e" }, { value: "f" }],
        [{ value: "g" }, { value: "h" }, { value: "i" }],
      ],
    });
  });

  it("selectCells toggles a cell on (adds to selection)", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectCells, { payload: { i: 0, j: 1 } });
    expect(store.getState().selected).toContainEqual([0, 1]);
    expect(store.getState().selected).toContainEqual([0, 0]);
  });

  it("selectCells deselects an already-selected cell", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectCells, { payload: { i: 0, j: 0 } });
    // [0,0] was in selection, clicking again removes it
    expect(store.getState().selected).not.toContainEqual([0, 0]);
  });

  it("selectVerticalCells selects an entire column", () => {
    store.dispatch(selectVerticalCells, { payload: { j: 1 } });
    expect(store.getState().selected).toHaveLength(3);
    expect(store.getState().selected.every((s) => s[1] === 1)).toBe(true);
  });

  it("selectVerticalCells with ctrlPressed appends to existing selection", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectVerticalCells, { payload: { j: 1, ctrlPressed: true } });
    // Original cell [0,0] plus all 3 cells in column 1
    expect(store.getState().selected.length).toBeGreaterThan(3);
    expect(store.getState().selected).toContainEqual([0, 0]);
  });

  it("selectHorizontalCells selects an entire row", () => {
    store.dispatch(selectHorizontalCells, { payload: { i: 1 } });
    expect(store.getState().selected).toHaveLength(3);
    expect(store.getState().selected.every((s) => s[0] === 1)).toBe(true);
  });

  it("selectHorizontalCells with ctrlPressed appends to existing selection", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectHorizontalCells, { payload: { i: 1, ctrlPressed: true } });
    expect(store.getState().selected.length).toBeGreaterThan(3);
    expect(store.getState().selected).toContainEqual([0, 0]);
  });

  it("clearSelection empties the selection", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(clearSelection);
    expect(store.getState().selected).toHaveLength(0);
  });

  it("updateInputTypes changes cell type on selected cells", () => {
    store.dispatch(addData, {
      payload: [[{ value: "a" }, { value: "b" }]],
    });
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(updateInputTypes, { payload: { type: "number" } });
    expect(store.getState().data[0][0].type).toBe("number");
  });

  it("selectCellsDrag selects a rectangular region", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
    expect(store.getState().selected).toHaveLength(4);
  });

  it("selectCellsDrag on same cell as lastSelected returns unchanged state", () => {
    store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
    const before = store.getState().selected;
    store.dispatch(selectCellsDrag, { payload: { i: 0, j: 0 } });
    expect(store.getState().selected).toEqual(before);
  });

  it("undo with empty undo stack is a no-op", () => {
    store.dispatch(addData, { payload: [[{ value: "x" }]] });
    // undo stack is empty after addData resets it
    const before = store.getState().data[0][0].value;
    store.dispatch(undo);
    expect(store.getState().data[0][0].value).toBe(before);
  });

  it("redo with empty redo stack is a no-op", () => {
    store.dispatch(addData, { payload: [[{ value: "y" }]] });
    const before = store.getState().data[0][0].value;
    store.dispatch(redo);
    expect(store.getState().data[0][0].value).toBe(before);
  });
});
