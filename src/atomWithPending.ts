import { atom } from 'jotai/vanilla';

const pendingPromise = new Promise<never>(() => {
  // Never fulfills
});

export const atomWithPending = <Value>() =>
  atom(pendingPromise as unknown as Value);
