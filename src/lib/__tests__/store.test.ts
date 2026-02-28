import { store } from "../store";
import { initialState, addData } from "../reducer";

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
