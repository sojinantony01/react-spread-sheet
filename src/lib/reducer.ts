import { generateColumns } from "./list/utils";

export type Selected = [number, number];

export interface Data {
  value: string;
  styles?: { [key: string]: string };
  type?: string;
  colSpan?: number;
  rowSpan?: number;
  skip?: boolean; //merged
}

interface Action {
  i: number;
  j: number;
  data: Data;
  type?: "add-row" | "add-column" | "delete-row" | "delete-column";
  actionData?: Data[];
}
export interface ListReducer {
  data: Data[][];
  selected: Selected[];
  lastSelected?: Selected;
  undo: Action[][];
  redo: Action[][];
}
export const initialState: ListReducer = {
  data: [[]],
  selected: [],
  undo: [],
  redo: [],
};

export interface StoreAction {
  payload: any;
  type?: string;
}

export interface DispatcherActions {
  [key: string]: (state: ListReducer, action: StoreAction) => ListReducer;
}

// Replace a single cell in the data grid, returning new row and data array references
// for only the affected row. All other rows keep the same reference (structural sharing).
const replaceCell = (data: Data[][], i: number, j: number, cell: Data): Data[][] => {
  const newRow = data[i].slice();
  newRow[j] = cell;
  const newData = data.slice();
  newData[i] = newRow;
  return newData;
};

const findSelection = (
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  data: Data[][],
): Selected[] => {
  const result: Selected[] = [];
  const rowInc = startRow <= endRow ? 1 : -1;
  const colInc = startCol <= endCol ? 1 : -1;
  const rowEnd = endRow + rowInc;
  const colEnd = endCol + colInc;
  const maxRow = data.length;
  for (let row = startRow; row !== rowEnd; row += rowInc) {
    if (row < 0 || row >= maxRow) continue;
    const maxCol = data[row].length;
    for (let col = startCol; col !== colEnd; col += colInc) {
      if (col >= 0 && col < maxCol) {
        result.push([row, col]);
      }
    }
  }
  return result;
};

const actions: DispatcherActions = {
  addData(state, action) {
    return { ...state, data: action.payload, undo: [], redo: [] };
  },

  changeData(state, action) {
    const { i, j, value, styles } = action.payload;
    const prevCell = state.data[i][j];
    const newCell: Data = styles ? { ...prevCell, value, styles } : { ...prevCell, value };
    return {
      ...state,
      data: replaceCell(state.data, i, j, newCell),
      undo: [...state.undo, [{ i, j, data: { ...prevCell } }]],
      redo: [],
    };
  },

  updateStyles(state, action) {
    const firstSelected = state.selected[0];
    const shouldRemove =
      !action.payload.replace &&
      firstSelected &&
      state.data[firstSelected[0]][firstSelected[1]]?.styles?.[action.payload.value.key] ===
        action.payload.value.value;

    const undo: Action[] = [];
    let data = state.data;
    state.selected.forEach((p) => {
      const prevCell = data[p[0]][p[1]];
      undo.push({ i: p[0], j: p[1], data: { ...prevCell } });
      let newStyles: Data["styles"];
      if (shouldRemove) {
        const s = { ...prevCell.styles };
        delete s[action.payload.value.key];
        newStyles = s;
      } else {
        newStyles = { ...prevCell.styles, [action.payload.value.key]: action.payload.value.value };
      }
      data = replaceCell(data, p[0], p[1], { ...prevCell, styles: newStyles });
    });

    return {
      ...state,
      data,
      undo: [...state.undo, undo],
      redo: [],
    };
  },

  deleteSelectItems(state) {
    const undo: Action[] = [];
    let data = state.data;
    state.selected.forEach((p) => {
      const prevCell = data[p[0]][p[1]];
      undo.push({ i: p[0], j: p[1], data: { ...prevCell } });
      data = replaceCell(data, p[0], p[1], { ...prevCell, value: "" });
    });
    return {
      ...state,
      data,
      undo: [...state.undo, undo],
      redo: [],
    };
  },

  selectOneCell(state, action) {
    return {
      ...state,
      selected: [[action.payload.i, action.payload.j]],
      lastSelected: [action.payload.i, action.payload.j],
    };
  },

  selectCells(state, action) {
    const index = state.selected.findIndex(
      (p) => p[0] === action.payload.i && p[1] === action.payload.j,
    );
    const newSelected = state.selected.slice();
    if (index > -1) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push([action.payload.i, action.payload.j]);
    }
    return {
      ...state,
      selected: newSelected,
      lastSelected: [action.payload.i, action.payload.j],
    };
  },

  selectAllCells(state) {
    const data = state.data;
    const rows = data.length;
    // Pre-allocate exact size — avoids repeated array growth.
    const cols = rows > 0 ? data[0].length : 0;
    const selected: Selected[] = new Array(rows * cols);
    let k = 0;
    for (let i = 0; i < rows; i++) {
      const rowLen = data[i].length;
      for (let j = 0; j < rowLen; j++) {
        selected[k++] = [i, j];
      }
    }
    selected.length = k;
    return { ...state, selected };
  },

  selectVerticalCells(state, action) {
    const selected: Selected[] = action.payload.ctrlPressed ? state.selected.slice() : [];
    for (let i = 0; i < state.data.length; i++) {
      selected.push([i, action.payload.j]);
    }
    return { ...state, selected };
  },

  selectHorizontalCells(state, action) {
    const selected: Selected[] = action.payload.ctrlPressed ? state.selected.slice() : [];
    state.data[action.payload.i].forEach((_, j) => {
      selected.push([action.payload.i, j]);
    });
    return { ...state, selected };
  },

  clearSelection(state) {
    return { ...state, selected: [] };
  },

  selectCellsDrag(state, action) {
    const [startRow, startCol] = state.lastSelected || [0, 0];
    const [endRow, endCol] = [action.payload.i, action.payload.j];
    if (startRow === endRow && startCol === endCol) {
      return state;
    }
    return {
      ...state,
      selected: findSelection(startRow, startCol, endRow, endCol, state.data),
    };
  },

  undo(state) {
    const newUndo = state.undo.slice();
    const lastAction = newUndo.pop();
    if (!lastAction || !lastAction.length) {
      return state;
    }
    const redo: Action[] = [];
    let data = state.data;
    lastAction.forEach((p) => {
      if (p.type === "add-row") {
        redo.push({ ...p });
        data = data.slice();
        data.splice(p.i, 1);
      } else if (p.type === "delete-row") {
        redo.push({ ...p });
        data = data.slice();
        p.actionData && data.splice(p.i, 0, p.actionData);
      } else if (p.type === "add-column") {
        redo.push({ ...p });
        data = data.map((row) => {
          const r = row.slice();
          r.splice(p.i, 1);
          return r;
        });
      } else if (p.type === "delete-column") {
        redo.push({ ...p });
        data = data.map((row, i) => {
          const r = row.slice();
          r.splice(p.i, 0, { ...(p.actionData?.[i] || { value: "" }) });
          return r;
        });
      } else {
        redo.push({ ...p, data: { ...data[p.i][p.j] } });
        data = replaceCell(data, p.i, p.j, p.data);
      }
    });
    return {
      ...state,
      data,
      undo: newUndo,
      redo: [...state.redo, redo],
    };
  },

  redo(state) {
    const newRedo = state.redo.slice();
    const lastAction = newRedo.pop();
    if (!lastAction || !lastAction.length) {
      return state;
    }
    const undo: Action[] = [];
    let data = state.data;
    lastAction.forEach((p) => {
      if (p.type === "add-row") {
        undo.push({ ...p });
        data = data.slice();
        data.splice(p.i, 0, generateColumns(data[0].length));
      } else if (p.type === "delete-row") {
        undo.push({ ...p });
        data = data.slice();
        data.splice(p.i, 1);
      } else if (p.type === "add-column") {
        undo.push({ ...p });
        data = data.map((row) => {
          const r = row.slice();
          r.splice(p.i, 0, { value: "" });
          return r;
        });
      } else if (p.type === "delete-column") {
        undo.push({ ...p });
        data = data.map((row) => {
          const r = row.slice();
          r.splice(p.i, 1);
          return r;
        });
      } else {
        undo.push({ ...p, data: { ...data[p.i][p.j] } });
        data = replaceCell(data, p.i, p.j, p.data);
      }
    });
    return {
      ...state,
      data,
      redo: newRedo,
      undo: [...state.undo, undo],
    };
  },

  bulkUpdate(state, action) {
    const selected = state.selected[0];
    const colDif = action.payload[action.payload.length - 1].index[1] - action.payload[0].index[1];
    const rowDif = action.payload[action.payload.length - 1].index[0] - action.payload[0].index[0];
    if (colDif < 0 || rowDif < 0) {
      action.payload.reverse();
    }
    const endCol = selected[1] + Math.abs(colDif);
    const endRow = selected[0] + Math.abs(rowDif);
    const startCol = selected[1];
    const startRow = selected[0];

    const newSelected = findSelection(startRow, startCol, endRow, endCol, state.data);
    const undo: Action[] = [];
    let data = state.data;
    newSelected.forEach((p, i) => {
      undo.push({ i: p[0], j: p[1], data: { ...data[p[0]][p[1]] } });
      const incoming = action.payload[i]?.data;
      if (incoming) {
        data = replaceCell(data, p[0], p[1], incoming);
      }
    });
    return {
      ...state,
      data,
      selected: newSelected,
      undo: [...state.undo, undo],
      redo: [],
    };
  },

  addRows(state, action) {
    return { ...state, data: [...state.data, ...action.payload] };
  },

  updateInputTypes(state, action) {
    const undo: Action[] = [];
    let data = state.data;
    state.selected.forEach((p) => {
      const prevCell = data[p[0]][p[1]];
      undo.push({ i: p[0], j: p[1], data: { ...prevCell } });
      data = replaceCell(data, p[0], p[1], { ...prevCell, type: action.payload.type });
    });
    return {
      ...state,
      data,
      undo: [...state.undo, undo],
      redo: [],
    };
  },

  addRow(state, action) {
    const index = action.payload.below ? state.selected[0][0] + 1 : state.selected[0][0];
    const newData = state.data.slice();
    newData.splice(index, 0, generateColumns(state.data[0].length));
    return {
      ...state,
      data: newData,
      undo: [...state.undo, [{ i: index, j: 0, type: "add-row", data: { value: "" } }]],
      redo: [],
    };
  },

  addColumn(state, action) {
    const index = action.payload.right ? state.selected[0][1] + 1 : state.selected[0][1];
    const newData = state.data.map((row) => {
      const r = row.slice();
      r.splice(index, 0, { value: "" });
      return r;
    });
    return {
      ...state,
      data: newData,
      undo: [...state.undo, [{ i: index, j: 0, type: "add-column", data: { value: "" } }]],
      redo: [],
    };
  },

  deleteRow(state) {
    const index = state.selected[0][0];
    const newData = state.data.slice();
    newData.splice(index, 1);
    return {
      ...state,
      data: newData,
      undo: [
        ...state.undo,
        [
          {
            i: index,
            j: 0,
            type: "delete-row",
            actionData: state.data[index],
            data: { value: "" },
          },
        ],
      ],
      redo: [],
    };
  },

  deleteColumn(state) {
    const index = state.selected[0][1];
    const actionData: Data[] = state.data.map((d) => d[index]);
    const newData = state.data.map((row) => {
      const r = row.slice();
      r.splice(index, 1);
      return r;
    });
    return {
      ...state,
      data: newData,
      undo: [
        ...state.undo,
        [{ i: index, j: 0, type: "delete-column", actionData, data: { value: "" } }],
      ],
      redo: [],
    };
  },

  mergeCells(state) {
    if (state.selected.length === 0) return state;

    const undo: Action[] = [];
    const cellForMerge = state.selected[0];
    let data = state.data;
    const cell = data[cellForMerge[0]][cellForMerge[1]];

    if (cell.rowSpan) {
      // Unmerge
      for (let i = cellForMerge[0]; i < cellForMerge[0] + (cell.rowSpan || 0); i++) {
        for (let j = cellForMerge[1]; j < cellForMerge[1] + (cell.colSpan || 0); j++) {
          undo.push({ i, j, data: { ...data[i][j] } });
          const { skip: _skip, ...rest } = data[i][j];
          data = replaceCell(data, i, j, rest);
        }
      }
      const { rowSpan: _rs, colSpan: _cs, ...mergeRest } = data[cellForMerge[0]][cellForMerge[1]];
      data = replaceCell(data, cellForMerge[0], cellForMerge[1], mergeRest);
    } else if (state.selected.length > 1) {
      state.selected.forEach((p, idx) => {
        undo.push({ i: p[0], j: p[1], data: { ...data[p[0]][p[1]] } });
        if (idx !== 0) {
          data = replaceCell(data, p[0], p[1], { ...data[p[0]][p[1]], value: "", skip: true });
        }
      });
      const rowSpan =
        Math.abs(state.selected[0][0] - state.selected[state.selected.length - 1][0]) + 1;
      const colSpan =
        Math.abs(state.selected[0][1] - state.selected[state.selected.length - 1][1]) + 1;
      data = replaceCell(data, cellForMerge[0], cellForMerge[1], {
        ...data[cellForMerge[0]][cellForMerge[1]],
        rowSpan,
        colSpan,
      });
    }

    return {
      ...state,
      data,
      selected: [cellForMerge],
      undo: [...state.undo, undo],
      redo: [],
    };
  },
};

export const {
  changeData,
  addData,
  updateStyles,
  selectOneCell,
  selectCells,
  deleteSelectItems,
  selectAllCells,
  selectVerticalCells,
  selectHorizontalCells,
  clearSelection,
  selectCellsDrag,
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
} = actions;
