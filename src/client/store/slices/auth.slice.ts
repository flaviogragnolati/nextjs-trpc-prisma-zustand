import { type StateCreator } from 'zustand';
import { type User } from '@prisma/client';
import { type RootState } from './root';

/**
 * Interface that defines the props of the auth slice
 */
export interface AuthProps {
  user: User | null;
}

/**
 * Interface that defines the actions of the auth slice
 */
export interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}

/**
 * Interface that defines the state of the auth slice
 */
export interface AuthSliceState extends AuthProps, AuthActions {}

const initialState: AuthProps = {
  user: null,
};

/**
 *
 * Factory function that creates the auth slice
 * StateCreator is a generic type that takes 4 parameters
 * @param RootState: The combined state of all slices
 * @param StoreMutatorsIdentifiers: An array of middlewares type definitions
 * @param NotUsed: Should be an empty array
 * @param AuthSliceState: The state of the auth slice
 */
export const createAuthSlice: StateCreator<
  RootState,
  [
    ['zustand/persist', unknown],
    ['zustand/immer', never],
    ['zustand/devtools', never],
  ],
  [],
  AuthSliceState
> = (set, get) => ({
  ...initialState,

  setUser: (user: User) => set({ user }, false, 'auth/setUser'),
  clearUser: () => set({ user: null }, false, 'auth/clearUser'),
});
