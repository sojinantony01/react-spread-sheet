import { useSyncExternalStore } from "react";
import { DispatcherActions, initialState, ListReducer, StoreAction } from "./reducer";

export interface Store {
  getState: () => ListReducer;
  // A pre-computed Set<"row,col"> kept in sync with state.selected.
  // Lets per-cell selected checks be O(1) instead of O(n selected cells).
  getSelectedSet: () => Set<string>;
  dispatch: (fn: DispatcherActions[string], action?: StoreAction) => void;
  subscribe: (onStoreChange: () => void) => () => void;
}

const createStore = (): Store => {
  let state = initialState;
  let selectedSet: Set<string> = new Set();

  const getState = (): ListReducer => state;
  const getSelectedSet = (): Set<string> => selectedSet;

  const listeners: Set<() => void> = new Set();

  const dispatch = (fn: DispatcherActions[string], action?: StoreAction) => {
    const next = fn(state, action || { payload: undefined });
    // Rebuild selectedSet only when selected array reference actually changed.
    if (next.selected !== state.selected) {
      selectedSet = new Set(next.selected.map(([r, c]) => `${r},${c}`));
    }
    state = next;
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, getSelectedSet, dispatch, subscribe };
};

export const store: Store = createStore();

export const useAppSelector = (store: Store, selector: (state: ListReducer) => any) =>
  useSyncExternalStore(store.subscribe, () => selector(store.getState()));
