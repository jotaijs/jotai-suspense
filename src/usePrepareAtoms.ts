import { useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import type { Atom } from 'jotai';
import { waitForAll } from 'jotai/utils';

type Scope = symbol | string | number;

export function usePrepareAtoms(atoms: Atom<unknown>[], scope?: Scope) {
  const allAtom = waitForAll(atoms);
  useAtom(
    useMemo(
      () =>
        atom((get) => {
          try {
            get(allAtom);
          } catch (e) {
            // ignored
          }
        }),
      [allAtom],
    ),
    scope,
  );
}
