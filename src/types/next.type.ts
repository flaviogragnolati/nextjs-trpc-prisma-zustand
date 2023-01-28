import type { NextPage } from 'next';
import type { ComponentAuthI } from './auth.type';

export type NextPageWithAuth<P = {}, IP = P> = NextPage<P, IP> & ComponentAuthI;
