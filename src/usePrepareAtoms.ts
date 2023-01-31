import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import type { Atom } from 'jotai/vanilla';

const useMemoList = <T>(list: T[], compareFn = (a: T, b: T) => a === b) => {
  const [state, setState] = useState(list);
  const listChanged =
    list.length !== state.length ||
    list.some((arg, index) => !compareFn(arg, state[index] as T));
  if (listChanged) {
    // schedule update, triggers re-render
    setState(list);
  }
  return listChanged ? list : state;
};

type Options = Parameters<typeof useAtomValue>[1];

export function usePrepareAtoms(atoms: Atom<unknown>[], options?: Options) {
  const stableAtoms = useMemoList(atoms);
  useAtomValue(
    useMemo(
      () =>
        atom((get) => {
          stableAtoms.map(get);
        }),
      [stableAtoms],
    ),
    options,
  );
}
