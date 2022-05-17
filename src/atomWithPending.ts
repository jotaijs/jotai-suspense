import { atom } from 'jotai';
import { pendingPromise } from './constants';

export const atomWithPending = <Value>() =>
  atom(pendingPromise as unknown as Value);
