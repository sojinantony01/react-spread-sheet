import { createSlice } from "@reduxjs/toolkit";

type Selected = [number, number];

export interface Data {
  value: string;
  styles?: {[key: string]: string}
}
export interface Listreducer {
  data: Data[][];
  selected: Selected[];
  lastSelected?: Selected;
}
const initialState: Listreducer = {
  data: [[]],
  selected: [],
};

const listSlice = createSlice({
  name: "list",
  initialState,
  reducers: {
    addData(state, action) {
      state.data = action.payload;
    },
    changeData(state, action) {
      state.data[action.payload.i][action.payload.j].value = action.payload.value;
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
      state.selected.forEach((p) => {
        if (add) {
          data[p[0]][p[1]].styles = {
            ...data[p[0]][p[1]].styles,
            [action.payload.value.key]: action.payload.value.value,
          };
        } else {
          delete data[p[0]][p[1]]?.styles?.[action.payload.value.key];
        }
      });
      state.data = data;
    },
    selectOneCell(state, action) {
      state.selected = [[action.payload.i, action.payload.j]];
      state.lastSelected = [action.payload.i, action.payload.j];
    },
    selectCells(state, action) {
      const index = state.selected.findIndex((p) => p[0] === action.payload.i && p[1] === action.payload.j);
      if (index > -1) {
        state.selected.splice(index, 1);
      } else {
        state.selected.push([action.payload.i, action.payload.j]);
      }
      state.lastSelected = [action.payload.i, action.payload.j];
    },
    deleteSelectItems(state) {
      state.selected.forEach((p) => {
        state.data[p[0]][p[1]].value = "";
      });
    },
    selectAllCells(state) {
      const selected: Selected[] = [];
      state.data.forEach((d, i) => {
        d.forEach((dd, j) => {
          selected.push([i, j]);
        });
      });
      state.selected = selected;
    },
    selectVerticalCells(state, action) {
      const selected: Selected[] = action.payload.ctrlPressed ? state.selected : [];
      for (let i = 0; i < state.data.length; i++) {
        selected.push([i, action.payload.j]);
      }
      state.selected = selected;
    },
    selectHorizontalCells(state, action) {
      const selected: Selected[] = action.payload.ctrlPressed ? state.selected : [];
      state.data[action.payload.i].forEach((dd, j) => {
        selected.push([action.payload.i, j]);
      });
      state.selected = selected;
    },
    clearSelection(state) {
      state.selected = [];
    },
    selectCellsDrag(state, action) {
      const [startRow, startCol] = state.lastSelected || [0, 0];
      const [endRow, endCol] = [action.payload.i, action.payload.j];
      const result: Selected[] = [];
      if (startRow === endRow && startCol === endCol) {
        return;
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
    },
    updateFont(state, action) {

    },
  },
});

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
} = listSlice.actions;

export default listSlice.reducer;
