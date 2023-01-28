import _ from 'lodash';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

import { type RootState } from './slices/root';
import { createMainSlice } from './slices/main.slice';
import { createAuthSlice } from './slices/auth.slice';

const isNotProd = process.env.NODE_ENV !== 'production';

const devtoolsOptions = { enabled: isNotProd };

export const useAppStore = create<RootState>()(
  persist(
    immer(
      devtools((...args) => {
        return {
          ...createMainSlice(...args),
          ...createAuthSlice(...args),
        };
      }, devtoolsOptions),
    ),
    {
      name: 'app-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) =>
        _.merge(persistedState, currentState),
      onRehydrateStorage: (state) => {
        console.debug('hydration starts');
        // optional
        return (state, error) => {
          if (error) {
            console.debug('an error happened during hydration', error);
          } else {
            state?.setHasHydrated(true);
            console.debug('hydration finished');
          }
        };
      },
    },
  ),
);
