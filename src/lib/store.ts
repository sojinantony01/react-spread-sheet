import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import { DispatcherActions, initialState, ListReducer, StoreAction } from "./reducer";

export interface Store {
  getState: ()=> ListReducer
  dispatch: (fn: DispatcherActions[string], action?: StoreAction) => void;
  subscribe: (onStoreChange: () => void) => () => void;
}

const createStore = (): Store => {
  let state = initialState;
  const getState = (): ListReducer => state;
  const listeners: Set<Function> = new Set();
  const dispatch = (fn: DispatcherActions[string], action?: StoreAction) => {
    state = fn(state, action || {payload: undefined});
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: Function) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return { getState, dispatch, subscribe };
};

export const store: Store = createStore();


export const useAppSelector = (store: Store, selector: (state: ListReducer) => any) =>
  useSyncExternalStore(
    store.subscribe,
    useCallback(() => selector(store.getState()), [store, selector])
  );
