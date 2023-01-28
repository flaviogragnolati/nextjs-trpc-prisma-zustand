import { env } from '@/env/server.mjs';

export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
export const isProd = env.NODE_ENV === 'production';

export const isBrowser = new Function(
  'try {return this===window;}catch(e){ return false;}',
);
export const isNode = new Function(
  'try {return this===global;}catch(e){return false;}',
);
