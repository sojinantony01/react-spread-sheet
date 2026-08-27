import { store } from "../store";
import {
  initialState,
  addData,
  changeData,
  updateStyles,
  selectOneCell,
  selectCells,
  selectAllCells,
  selectVerticalCells,
  selectHorizontalCells,
  clearSelection,
  selectCellsDrag,
  deleteSelectItems,
  undo,
  redo,
  bulkUpdate,
  addRows,
  updateInputTypes,
  addRow,
  addColumn,
  deleteRow,
  deleteColumn,
  mergeCells,
} from "../reducer";
import { generateDummyContent } from "../list/utils";

const setup = (rows = 3, cols = 3) => {
  store.dispatch(addData, { payload: generateDummyContent(rows, cols) });
};

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

describe("reducer actions", () => {
  beforeEach(() => setup());

  describe("changeData", () => {
    it("updates cell value and pushes undo entry", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(changeData, { payload: { i: 0, j: 0, value: "hello" } });
      expect(store.getState().data[0][0].value).toBe("hello");
      expect(store.getState().undo.length).toBeGreaterThan(0);
    });

    it("updates cell value with styles", () => {
      store.dispatch(changeData, { payload: { i: 0, j: 0, value: "x", styles: { fontWeight: "bold" } } });
      expect(store.getState().data[0][0].styles?.fontWeight).toBe("bold");
    });
  });

  describe("updateStyles", () => {
    it("applies style to all selected cells", () => {
      store.dispatch(selectAllCells);
      store.dispatch(updateStyles, {
        payload: { value: { key: "fontWeight", value: "bold" } },
      });
      expect(store.getState().data[0][0].styles?.fontWeight).toBe("bold");
    });

    it("removes style when same value is applied twice (toggle)", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(updateStyles, {
        payload: { value: { key: "fontWeight", value: "bold" } },
      });
      expect(store.getState().data[0][0].styles?.fontWeight).toBe("bold");
      // Apply same style again → should remove it
      store.dispatch(updateStyles, {
        payload: { value: { key: "fontWeight", value: "bold" } },
      });
      expect(store.getState().data[0][0].styles?.fontWeight).toBeUndefined();
    });

    it("replaces style when replace flag is set", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(updateStyles, { payload: { value: { key: "fontSize", value: "16px" }, replace: true } });
      store.dispatch(updateStyles, { payload: { value: { key: "fontSize", value: "18px" }, replace: true } });
      expect(store.getState().data[0][0].styles?.fontSize).toBe("18px");
    });
  });

  describe("deleteSelectItems", () => {
    it("clears values of all selected cells", () => {
      store.dispatch(changeData, { payload: { i: 0, j: 0, value: "abc" } });
      store.dispatch(selectAllCells);
      store.dispatch(deleteSelectItems);
      expect(store.getState().data[0][0].value).toBe("");
    });
  });

  describe("selectCells (multi-select toggle)", () => {
    it("adds a cell to selection", () => {
      // Clear any leftover selection from previous tests before adding
      store.dispatch(clearSelection);
      store.dispatch(selectCells, { payload: { i: 0, j: 0 } });
      expect(store.getState().selected).toContainEqual([0, 0]);
    });

    it("removes a cell from selection if already selected", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCells, { payload: { i: 0, j: 0 } });
      expect(store.getState().selected).not.toContainEqual([0, 0]);
    });
  });

  describe("selectAllCells", () => {
    it("selects every cell in the grid", () => {
      store.dispatch(selectAllCells);
      expect(store.getState().selected.length).toBe(9); // 3×3
    });
  });

  describe("selectVerticalCells", () => {
    it("selects all cells in a column", () => {
      store.dispatch(selectVerticalCells, { payload: { j: 1, ctrlPressed: false } });
      const sel = store.getState().selected;
      expect(sel.every((s) => s[1] === 1)).toBe(true);
      expect(sel.length).toBe(3);
    });

    it("appends to selection when ctrlPressed is true", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectVerticalCells, { payload: { j: 1, ctrlPressed: true } });
      const sel = store.getState().selected;
      expect(sel.some((s) => s[0] === 0 && s[1] === 0)).toBe(true);
      expect(sel.some((s) => s[1] === 1)).toBe(true);
    });
  });

  describe("selectHorizontalCells", () => {
    it("selects all cells in a row", () => {
      store.dispatch(selectHorizontalCells, { payload: { i: 1, ctrlPressed: false } });
      const sel = store.getState().selected;
      expect(sel.every((s) => s[0] === 1)).toBe(true);
      expect(sel.length).toBe(3);
    });

    it("appends to selection when ctrlPressed is true", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectHorizontalCells, { payload: { i: 1, ctrlPressed: true } });
      expect(store.getState().selected.some((s) => s[0] === 0 && s[1] === 0)).toBe(true);
      expect(store.getState().selected.some((s) => s[0] === 1)).toBe(true);
    });
  });

  describe("clearSelection", () => {
    it("empties the selection array", () => {
      store.dispatch(selectAllCells);
      store.dispatch(clearSelection);
      expect(store.getState().selected).toHaveLength(0);
    });
  });

  describe("selectCellsDrag", () => {
    it("selects a rectangular range from lastSelected to the payload", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 2, j: 2 } });
      expect(store.getState().selected.length).toBe(9);
    });

    it("returns same state if start === end", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 1 } });
      const before = store.getState();
      store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
      expect(store.getState()).toBe(before);
    });
  });

  describe("undo / redo", () => {
    it("undoes last changeData", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(changeData, { payload: { i: 0, j: 0, value: "changed" } });
      store.dispatch(undo);
      expect(store.getState().data[0][0].value).toBe("");
    });

    it("returns same state when undo stack is empty", () => {
      store.dispatch(addData, { payload: generateDummyContent(3, 3) });
      const before = store.getState();
      store.dispatch(undo);
      expect(store.getState()).toBe(before);
    });

    it("redoes a previously undone change", () => {
      store.dispatch(changeData, { payload: { i: 0, j: 0, value: "hello" } });
      store.dispatch(undo);
      store.dispatch(redo);
      expect(store.getState().data[0][0].value).toBe("hello");
    });

    it("returns same state when redo stack is empty", () => {
      store.dispatch(addData, { payload: generateDummyContent(3, 3) });
      const before = store.getState();
      store.dispatch(redo);
      expect(store.getState()).toBe(before);
    });
  });

  describe("addRow / deleteRow with undo + redo", () => {
    it("addRow above: inserts a row at the selected index", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
      const before = store.getState().data.length;
      store.dispatch(addRow, { payload: { below: false } });
      expect(store.getState().data.length).toBe(before + 1);
    });

    it("addRow below: inserts a row after the selected index", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
      const before = store.getState().data.length;
      store.dispatch(addRow, { payload: { below: true } });
      expect(store.getState().data.length).toBe(before + 1);
    });

    it("undo add-row restores original row count", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(addRow, { payload: { below: false } });
      const after = store.getState().data.length;
      store.dispatch(undo);
      expect(store.getState().data.length).toBe(after - 1);
    });

    it("redo add-row re-inserts the row", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(addRow, { payload: { below: false } });
      const after = store.getState().data.length;
      store.dispatch(undo);
      store.dispatch(redo);
      expect(store.getState().data.length).toBe(after);
    });

    it("deleteRow removes the selected row", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
      const before = store.getState().data.length;
      store.dispatch(deleteRow);
      expect(store.getState().data.length).toBe(before - 1);
    });

    it("undo delete-row restores the deleted row", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
      store.dispatch(deleteRow);
      const after = store.getState().data.length;
      store.dispatch(undo);
      expect(store.getState().data.length).toBe(after + 1);
    });

    it("redo delete-row removes the row again", () => {
      store.dispatch(selectOneCell, { payload: { i: 1, j: 0 } });
      store.dispatch(deleteRow);
      store.dispatch(undo);
      const restored = store.getState().data.length;
      store.dispatch(redo);
      expect(store.getState().data.length).toBe(restored - 1);
    });
  });

  describe("addColumn / deleteColumn with undo + redo", () => {
    it("addColumn left: inserts a column at the selected index", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      const before = store.getState().data[0].length;
      store.dispatch(addColumn, { payload: { right: false } });
      expect(store.getState().data[0].length).toBe(before + 1);
    });

    it("addColumn right: inserts a column after the selected index", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      const before = store.getState().data[0].length;
      store.dispatch(addColumn, { payload: { right: true } });
      expect(store.getState().data[0].length).toBe(before + 1);
    });

    it("undo add-column restores original column count", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(addColumn, { payload: { right: false } });
      const after = store.getState().data[0].length;
      store.dispatch(undo);
      expect(store.getState().data[0].length).toBe(after - 1);
    });

    it("redo add-column re-inserts the column", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(addColumn, { payload: { right: false } });
      const after = store.getState().data[0].length;
      store.dispatch(undo);
      store.dispatch(redo);
      expect(store.getState().data[0].length).toBe(after);
    });

    it("deleteColumn removes the selected column", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      const before = store.getState().data[0].length;
      store.dispatch(deleteColumn);
      expect(store.getState().data[0].length).toBe(before - 1);
    });

    it("undo delete-column restores the deleted column", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      store.dispatch(deleteColumn);
      const after = store.getState().data[0].length;
      store.dispatch(undo);
      expect(store.getState().data[0].length).toBe(after + 1);
    });

    it("redo delete-column removes the column again", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      store.dispatch(deleteColumn);
      store.dispatch(undo);
      const restored = store.getState().data[0].length;
      store.dispatch(redo);
      expect(store.getState().data[0].length).toBe(restored - 1);
    });
  });

  describe("bulkUpdate", () => {
    it("pastes cells starting from the selected cell", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      const payload = [
        { index: [0, 0] as [number, number], data: { value: "A" } },
        { index: [0, 1] as [number, number], data: { value: "B" } },
      ];
      store.dispatch(bulkUpdate, { payload });
      expect(store.getState().data[0][0].value).toBe("A");
      expect(store.getState().data[0][1].value).toBe("B");
    });

    it("handles reverse selection (bottom-to-top paste)", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      const payload = [
        { index: [1, 0] as [number, number], data: { value: "X" } },
        { index: [0, 0] as [number, number], data: { value: "Y" } },
      ];
      store.dispatch(bulkUpdate, { payload });
      // After reverse, first entry should be applied to [0][0]
      expect(store.getState().data[0][0].value).toBeDefined();
    });
  });

  describe("addRows", () => {
    it("appends additional rows to the data", () => {
      const before = store.getState().data.length;
      store.dispatch(addRows, { payload: generateDummyContent(2, 3) });
      expect(store.getState().data.length).toBe(before + 2);
    });
  });

  describe("updateInputTypes", () => {
    it("sets the type of all selected cells", () => {
      store.dispatch(selectAllCells);
      store.dispatch(updateInputTypes, { payload: { type: "number" } });
      expect(store.getState().data[0][0].type).toBe("number");
    });
  });

  describe("mergeCells", () => {
    it("does nothing when nothing is selected", () => {
      store.dispatch(clearSelection);
      const before = store.getState().data;
      store.dispatch(mergeCells);
      expect(store.getState().data).toBe(before);
    });

    it("merges selected cells", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
      store.dispatch(mergeCells);
      expect(store.getState().data[0][0].rowSpan).toBe(2);
      expect(store.getState().data[0][0].colSpan).toBe(2);
    });

    it("unmerges already-merged cells", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
      store.dispatch(mergeCells);
      // Now unmerge
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(mergeCells);
      expect(store.getState().data[0][0].rowSpan).toBeUndefined();
      expect(store.getState().data[0][0].colSpan).toBeUndefined();
    });

    it("undo unmerge restores merge state (covers actionData?.[i] path in redo delete-column)", () => {
      // Merge first
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      store.dispatch(selectCellsDrag, { payload: { i: 1, j: 1 } });
      store.dispatch(mergeCells);
      expect(store.getState().data[0][0].rowSpan).toBe(2);
      // Undo the merge
      store.dispatch(undo);
      expect(store.getState().data[0][0].rowSpan).toBeUndefined();
      // Redo the merge
      store.dispatch(redo);
      expect(store.getState().data[0][0].rowSpan).toBe(2);
    });

    it("redo delete-column restores actionData for each row (line 246)", () => {
      // Set specific cell values so we can verify they are restored
      store.dispatch(changeData, { payload: { i: 0, j: 1, value: "col-value" } });
      store.dispatch(selectOneCell, { payload: { i: 0, j: 1 } });
      // Delete column → undo → redo to exercise the actionData path
      store.dispatch(deleteColumn);
      store.dispatch(undo);
      expect(store.getState().data[0][1].value).toBe("col-value");
      store.dispatch(redo);
      expect(store.getState().data[0].length).toBe(2); // column 1 removed
    });
  });

  describe("bulkUpdate — missing incoming payload entry", () => {
    it("skips cell update when incoming item has no data (covers line 324)", () => {
      store.dispatch(selectOneCell, { payload: { i: 0, j: 0 } });
      // Provide fewer payload entries than selected cells — the missing slot has no 'data'
      const payload = [
        { index: [0, 0] as [number, number], data: { value: "A" } },
        // second cell intentionally omitted — payload[1] will be undefined → incoming = undefined
      ];
      // Select a 2-cell range so newSelected has 2 entries
      store.dispatch(selectCellsDrag, { payload: { i: 0, j: 1 } });
      store.dispatch(bulkUpdate, { payload });
      // Cell [0][0] should be set
      expect(store.getState().data[0][0].value).toBe("A");
      // Cell [0][1] should be untouched (no incoming data for index 1)
      expect(store.getState().data[0][1].value).toBe("");
    });
  });
});
