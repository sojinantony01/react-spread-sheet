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

const findSelection = (
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  data: Data[][],
): Selected[] => {
  const result: Selected[] = [];
  // Determine iteration directions
  const rowIncrement = startRow <= endRow ? 1 : -1;
  const colIncrement = startCol <= endCol ? 1 : -1;
  const matrix = data;
  for (let row = startRow; row !== endRow + rowIncrement; row += rowIncrement) {
    for (let col = startCol; col !== endCol + colIncrement; col += colIncrement) {
      if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length) {
        result.push([row, col]);
      }
    }
  }
  return result;
};

const actions: DispatcherActions = {
  addData(state, action) {
    state.data = action.payload;
    return state;
  },
  changeData(state, action) {
    state.undo.push([
      {
        i: action.payload.i,
        j: action.payload.j,
        data: { ...state.data[action.payload.i][action.payload.j] },
      },
    ]);
    state.redo = [];
    state.data[action.payload.i][action.payload.j].value = action.payload.value;
    if (action.payload.styles) {
      state.data[action.payload.i][action.payload.j].styles = action.payload.styles;
    }
    return state;
  },
  updateStyles(state, action) {
    let add = true;
    if (
      !action.payload.replace &&
      state.selected[0] &&
      state.data[state.selected[0][0]][state.selected[0][1]]?.styles?.[action.payload.value.key] ===
        action.payload.value.value
    ) {
      add = false;
    }
    const data: Data[][] = state.data;
    const undo: Action[] = [];
    state.selected.forEach((p) => {
      undo.push({ i: p[0], j: p[1], data: { ...state.data[p[0]][p[1]] } });
      if (add) {
        data[p[0]][p[1]].styles = {
          ...data[p[0]][p[1]].styles,
          [action.payload.value.key]: action.payload.value.value,
        };
      } else {
        const styles = { ...data[p[0]][p[1]]?.styles };
        delete styles[action.payload.value.key];
        data[p[0]][p[1]].styles = styles;
      }
    });
    state.redo = [];
    state.undo.push(undo);
    state.data = data;
    return state;
  },

  deleteSelectItems(state) {
    const undo: Action[] = [];
    state.selected.forEach((p) => {
      undo.push({ i: p[0], j: p[1], data: { ...state.data[p[0]][p[1]] } });
      state.data[p[0]][p[1]].value = "";
    });
    state.redo = [];
    state.undo.push(undo);
    return state;
  },

  selectOneCell(state, action) {
    state.selected = [[action.payload.i, action.payload.j]];
    state.lastSelected = [action.payload.i, action.payload.j];
    return state;
  },
  selectCells(state, action) {
    const index = state.selected.findIndex(
      (p) => p[0] === action.payload.i && p[1] === action.payload.j,
    );
    if (index > -1) {
      state.selected.splice(index, 1);
    } else {
      state.selected.push([action.payload.i, action.payload.j]);
    }
    state.lastSelected = [action.payload.i, action.payload.j];
    return state;
  },
  selectAllCells(state) {
    const selected: Selected[] = [];
    state.data.forEach((d, i) => {
      d.forEach((dd, j) => {
        selected.push([i, j]);
      });
    });
    state.selected = selected;
    return state;
  },
  selectVerticalCells(state, action) {
    const selected: Selected[] = action.payload.ctrlPressed ? state.selected : [];
    for (let i = 0; i < state.data.length; i++) {
      selected.push([i, action.payload.j]);
    }
    state.selected = selected;
    return state;
  },
  selectHorizontalCells(state, action) {
    const selected: Selected[] = action.payload.ctrlPressed ? state.selected : [];
    state.data[action.payload.i].forEach((dd, j) => {
      selected.push([action.payload.i, j]);
    });
    state.selected = selected;
    return state;
  },
  clearSelection(state) {
    state.selected = [];
    return state;
  },
  selectCellsDrag(state, action) {
    const [startRow, startCol] = state.lastSelected || [0, 0];
    const [endRow, endCol] = [action.payload.i, action.payload.j];
    if (startRow === endRow && startCol === endCol) {
      return state;
    }

    state.selected = findSelection(startRow, startCol, endRow, endCol, state.data);
    return state;
  },
  undo(state) {
    const lastAction = state.undo.pop();
    const data = state.data;
    if (lastAction && lastAction.length) {
      const redo: Action[] = [];
      lastAction.forEach((p) => {
        if (p.type === "add-row") {
          //delete the row
          redo.push({ ...p });
          data.splice(p.i, 1);
        } else if (p.type === "delete-row") {
          //add the row with actionData
          redo.push({ ...p });
          p.actionData && state.data.splice(p.i, 0, p.actionData);
        } else if (p.type === "add-column") {
          redo.push({ ...p });
          state.data.forEach((d) => {
            d.splice(p.i, 1);
          });
        } else if (p.type === "delete-column") {
          redo.push({ ...p });
          data.forEach((d, i) => {
            d.splice(p.i, 0, { ...(p.actionData?.[i] || { value: "" }) });
          });
        } else {
          redo.push({ ...p, data: { ...state.data[p.i][p.j] } });
          data[p.i][p.j] = p.data;
        }
      });
      state.redo.push(redo);
      state.data = data;
    }
    return state;
  },
  redo(state) {
    const lastAction = state.redo.pop();
    const data = state.data;
    if (lastAction && lastAction.length) {
      const undo: Action[] = [];
      lastAction.forEach((p) => {
        if (p.type === "add-row") {
          undo.push({ ...p });
          data.splice(p.i, 0, generateColumns(state.data[0].length));
        } else if (p.type === "delete-row") {
          undo.push({ ...p });
          state.data.splice(p.i, 1);
        } else if (p.type === "add-column") {
          undo.push({ ...p });
          data.forEach((d) => {
            d.splice(p.i, 0, { value: "" });
          });
        } else if (p.type === "delete-column") {
          undo.push({ ...p });
          state.data.forEach((d) => {
            d.splice(p.i, 1);
          });
        } else {
          undo.push({ ...p, data: { ...state.data[p.i][p.j] } });
          data[p.i][p.j] = p.data;
        }
      });
      state.undo.push(undo);
      state.data = data;
    }
    return state;
  },
  bulkUpdate(state, action) {
    const data = state.data;
    const selected = state.selected[0];
    const colDif = action.payload[action.payload.length - 1].index[1] - action.payload[0].index[1];
    const rowDif = action.payload[action.payload.length - 1].index[0] - action.payload[0].index[0];
    if (colDif < 0 || rowDif < 0) {
      action.payload.reverse();
    }
    let endCol = selected[1] + Math.abs(colDif);
    let endRow = selected[0] + Math.abs(rowDif);
    let startCol = selected[1];
    let startRow = selected[0];

    const newSelected = findSelection(startRow, startCol, endRow, endCol, data);
    const undo: Action[] = [];
    newSelected.forEach((p, i) => {
      undo.push({
        i: p[0],
        j: p[1],
        data: { ...state.data[p[0]][p[1]] },
      });
      data[p[0]][p[1]] = action.payload[i]?.data || data[p[0]][p[1]];
    });
    state.data = data;
    state.selected = newSelected;
    state.redo = [];
    state.undo.push(undo);
    return state;
  },
  addRows(state, action) {
    state.data.push(...action.payload);
    return state;
  },
  updateInputTypes(state, action) {
    const data = state.data;
    const undo: Action[] = [];
    state.selected.forEach((p) => {
      undo.push({ i: p[0], j: p[1], data: { ...state.data[p[0]][p[1]] } });
      data[p[0]][p[1]].type = action.payload.type;
    });
    state.redo = [];
    state.undo.push(undo);
    state.data = data;
    return state;
  },
  addRow(state, action) {
    state.redo = [];
    const index = action.payload.below ? state.selected[0][0] + 1 : state.selected[0][0];
    state.undo.push([{ i: index, j: 0, type: "add-row", data: { value: "" } }]);
    state.data.splice(index, 0, generateColumns(state.data[0].length));
    return state;
  },
  addColumn(state, action) {
    state.redo = [];
    const index = action.payload.right ? state.selected[0][1] + 1 : state.selected[0][1];
    const data = state.data;
    state.undo.push([{ i: index, j: 0, type: "add-column", data: { value: "" } }]);
    data.forEach((d) => {
      d.splice(index, 0, { value: "" });
    });
    state.data = data;
    return state;
  },
  deleteRow(state) {
    state.redo = [];
    const index = state.selected[0][0];
    state.undo.push([
      { i: index, j: 0, type: "delete-row", actionData: state.data[index], data: { value: "" } },
    ]);
    state.data.splice(index, 1);
    return state;
  },
  deleteColumn(state) {
    state.redo = [];
    const index = state.selected[0][1];
    const actionData: Data[] = [];
    state.data.forEach((d) => {
      actionData.push(d[index]);
      d.splice(index, 1);
    });
    state.undo.push([
      { i: index, j: 0, type: "delete-column", actionData: actionData, data: { value: "" } },
    ]);
    return state;
  },
  mergeCells(state) {
    if (state.selected.length > 0) {
      state.redo = [];
      const undo: Action[] = [];
      const cellForMerge = state.selected[0];
      const data = state.data;
      if (data[cellForMerge[0]][cellForMerge[1]].rowSpan) {
        for (
          let i = cellForMerge[0];
          i < cellForMerge[0] + (data[cellForMerge[0]][cellForMerge[1]].rowSpan || 0);
          i++
        ) {
          for (
            let j = cellForMerge[1];
            j < cellForMerge[1] + (data[cellForMerge[0]][cellForMerge[1]].colSpan || 0);
            j++
          ) {
            undo.push({ i: i, j: j, data: { ...state.data[i][j] } });
            data[i][j].skip = undefined;
          }
        }
        data[cellForMerge[0]][cellForMerge[1]].rowSpan = undefined;
        data[cellForMerge[0]][cellForMerge[1]].colSpan = undefined;
      } else if (state.selected.length > 1) {
        state.selected.forEach((p, i) => {
          undo.push({ i: p[0], j: p[1], data: { ...state.data[p[0]][p[1]] } });
          if (i !== 0) {
            data[p[0]][p[1]].value = "";
            data[p[0]][p[1]].skip = true;
          }
        });
        data[cellForMerge[0]][cellForMerge[1]].rowSpan =
          Math.abs(state.selected[0][0] - state.selected[state.selected.length - 1][0]) + 1;
        data[cellForMerge[0]][cellForMerge[1]].colSpan =
          Math.abs(state.selected[0][1] - state.selected[state.selected.length - 1][1]) + 1;
      }
      state.selected = [cellForMerge];
      state.data = data;
      state.undo.push(undo);
    }
    return state;
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
