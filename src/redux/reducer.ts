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
  },
});

export const { changeData, addData } = listSlice.actions;

export default listSlice.reducer;
