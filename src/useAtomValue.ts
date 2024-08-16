import { useDebugValue, useEffect, useReducer } from 'react';
import type { ReducerWithoutAction } from 'react';
import type { Atom, ExtractAtomValue } from 'jotai/vanilla';
import { useStore } from 'jotai/react';

// Unlike useAtomValue from 'jotai/react',
// this hook doesn't resolve promises.

type Store = ReturnType<typeof useStore>;

type Options = Parameters<typeof useStore>[0] & {
  delay?: number;
};

export function useAtomValue<Value>(
  atom: Atom<Value>,
  options?: Options,
): Value;

export function useAtomValue<AtomType extends Atom<unknown>>(
  atom: AtomType,
  options?: Options,
): ExtractAtomValue<AtomType>;

export function useAtomValue<Value>(atom: Atom<Value>, options?: Options) {
  const store = useStore(options);

  const [[valueFromReducer, storeFromReducer, atomFromReducer], rerender] =
    useReducer<
      ReducerWithoutAction<readonly [Value, Store, typeof atom]>,
      undefined
    >(
      (prev) => {
        const nextValue = store.get(atom);
        if (
          Object.is(prev[0], nextValue) &&
          prev[1] === store &&
          prev[2] === atom
        ) {
          return prev;
        }
        return [nextValue, store, atom];
      },
      undefined,
      () => [store.get(atom), store, atom],
    );

  let value = valueFromReducer;
  if (storeFromReducer !== store || atomFromReducer !== atom) {
    rerender();
    value = store.get(atom);
  }

  const delay = options?.delay;
  useEffect(() => {
    const unsub = store.sub(atom, () => {
      if (typeof delay === 'number') {
        // delay rerendering to wait a promise possibly to resolve
        setTimeout(rerender, delay);
        return;
      }
      rerender();
    });
    rerender();
    return unsub;
  }, [store, atom, delay]);

  useDebugValue(value);
  return value;
}
