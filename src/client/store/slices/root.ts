import { MainSliceState } from './main.slice';
import { AuthSliceState } from './auth.slice';

/**
 * Interface that extends the state of all slices
 */
export interface RootState extends MainSliceState, AuthSliceState {}
