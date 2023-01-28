import { type StateCreator } from 'zustand';
import { type RootState } from './root';

export interface MainProps {
  _hasHydrated: boolean;
}

export interface MainActions {
  setHasHydrated: (hasHydrated: boolean) => void;
  clearStore: () => void;
}

export interface MainSliceState extends MainProps, MainActions {}

const initialState: MainProps = {
  _hasHydrated: false, // This is a private property to check if the store has been hydrated.
};

export const createMainSlice: StateCreator<
  RootState,
  [
    ['zustand/persist', unknown],
    ['zustand/immer', never],
    ['zustand/devtools', never],
  ],
  [],
  MainSliceState
> = (set, get) => ({
  ...initialState,
  setHasHydrated: (hasHydrated: boolean) =>
    set({ _hasHydrated: hasHydrated }, false, 'main/setHasHydrated'),
  clearStore: () => {
    console.warn('[NOT IMPLEMENTED]Clearing store...');
  },
});
