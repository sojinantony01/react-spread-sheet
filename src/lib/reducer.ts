type Selected = [number, number];

export interface Data {
  value: string;
  styles?: {[key: string]: string}
}

interface Action {
  i: number;
  j: number;
  data: Data;
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
  redo: []
};

export interface StoreAction {
    payload: any;
    type?: string;
}

export interface DispatcherActions {
  [key: string]: (state: ListReducer, action: StoreAction) => ListReducer
}

const actions: DispatcherActions = {
    addData(state, action) {
      state.data = action.payload;
      return state;
    },
    changeData(state, action) {
      state.undo.push([
        { i: action.payload.i, j: action.payload.j, data: {...state.data[action.payload.i][action.payload.j]} },
      ]);
      state.redo = [];
      state.data[action.payload.i][action.payload.j].value = action.payload.value;
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
        undo.push({ i: p[0], j: p[1], data: {...state.data[p[0]][p[1]]} });
        if (add) {
          data[p[0]][p[1]].styles = {
            ...data[p[0]][p[1]].styles,
            [action.payload.value.key]: action.payload.value.value,
          };
        } else {
          delete data[p[0]][p[1]]?.styles?.[action.payload.value.key];
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
        undo.push({ i: p[0], j: p[1], data: {...state.data[p[0]][p[1]]} });
        state.data[p[0]][p[1]].value = "";
      });
      state.undo.push(undo);
      return state;
    },

    selectOneCell(state, action) {
      state.selected = [[action.payload.i, action.payload.j]];
      state.lastSelected = [action.payload.i, action.payload.j];
      return state;
    },
    selectCells(state, action) {
      const index = state.selected.findIndex((p) => p[0] === action.payload.i && p[1] === action.payload.j);
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
      const result: Selected[] = [];
      if (startRow === endRow && startCol === endCol) {
        return state
      }
      // Determine iteration directions
      const rowIncrement = startRow <= endRow ? 1 : -1;
      const colIncrement = startCol <= endCol ? 1 : -1;
      const matrix = state.data;
      for (let row = startRow; row !== endRow + rowIncrement; row += rowIncrement) {
        for (let col = startCol; col !== endCol + colIncrement; col += colIncrement) {
          if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length) {
            result.push([row, col]);
          }
        }
      }

      state.selected = result;
      return state;
    },
    undo(state) {
      const lastAction = state.undo.pop();
      const data = state.data;
      if (lastAction && lastAction.length) {
        const redo: Action[] = []
        lastAction.forEach((p) => {
          redo.push({ ...p, data: {...state.data[p.i][p.j]} });
          data[p.i][p.j] = p.data;
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
          undo.push({ ...p, data: {...state.data[p.i][p.j]} });
          data[p.i][p.j] = p.data;
        });
        state.undo.push(undo);
        state.data = data;
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
  redo
} = actions;
