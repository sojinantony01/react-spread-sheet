import { createSlice } from "@reduxjs/toolkit";

export interface Listreducer {
  data: any[][];
}
const initialState: Listreducer = {
  data: [[]],
};

const listSlice = createSlice({
  name: "list",
  initialState,
  reducers: {
    addData(state, action) {
      state.data = action.payload;
    },
    changeData(state, action) {
      state.data[action.payload.i][action.payload.j].value =
        action.payload.value;
    },
    updateStyles(state, action) {
      if (
        state.data[action.payload.i][action.payload.j]?.styles?.[
          action.payload.value.key
        ] === action.payload.value.value
      ) {
        delete state.data[action.payload.i][action.payload.j]?.styles?.[
          action.payload.value.key
        ];
      } else {
        state.data[action.payload.i][action.payload.j].styles = {
          ...state.data[action.payload.i][action.payload.j].styles,
          [action.payload.value.key]: action.payload.value.value,
        };
      }
    },
  },
});

export const { changeData, addData, updateStyles } = listSlice.actions;

export default listSlice.reducer;
