import { atom } from 'jotai';

const pendingPromise = new Promise<never>(() => {
  // Never fulfills
});

export const atomWithPending = <Value>() =>
  atom(pendingPromise as unknown as Value);
