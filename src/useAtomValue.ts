import { useDebugValue, useEffect, useReducer } from 'react';
import type { Atom, ExtractAtomValue } from 'jotai/vanilla';
import { INTERNAL_registerAbortHandler as registerAbortHandler } from 'jotai/vanilla/internals';
import { useStore } from 'jotai/react';
import React from 'react';

// Unlike useAtomValue from 'jotai/react',
// this hook doesn't resolve promises.

type Store = ReturnType<typeof useStore>;

const isPromiseLike = (x: unknown): x is PromiseLike<unknown> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof (x as any)?.then === 'function';

const attachPromiseStatus = <T>(
  promise: PromiseLike<T> & {
    status?: 'pending' | 'fulfilled' | 'rejected';
    value?: T;
    reason?: unknown;
  },
) => {
  if (!promise.status) {
    promise.status = 'pending';
    promise.then(
      (v) => {
        promise.status = 'fulfilled';
        promise.value = v;
      },
      (e) => {
        promise.status = 'rejected';
        promise.reason = e;
      },
    );
  }
};

const continuablePromiseMap = new WeakMap<
  PromiseLike<unknown>,
  Promise<unknown>
>();

const createContinuablePromise = <T>(
  promise: PromiseLike<T>,
  getValue: () => PromiseLike<T> | T,
) => {
  let continuablePromise = continuablePromiseMap.get(promise);
  if (!continuablePromise) {
    continuablePromise = new Promise<T>((resolve, reject) => {
      let curr = promise;
      const onFulfilled = (me: PromiseLike<T>) => (v: T) => {
        if (curr === me) {
          resolve(v);
        }
      };
      const onRejected = (me: PromiseLike<T>) => (e: unknown) => {
        if (curr === me) {
          reject(e);
        }
      };
      const onAbort = () => {
        try {
          const nextValue = getValue();
          if (isPromiseLike(nextValue)) {
            continuablePromiseMap.set(nextValue, continuablePromise!);
            curr = nextValue;
            nextValue.then(onFulfilled(nextValue), onRejected(nextValue));
            registerAbortHandler(nextValue, onAbort);
          } else {
            resolve(nextValue);
          }
        } catch (e) {
          reject(e);
        }
      };
      promise.then(onFulfilled(promise), onRejected(promise));
      registerAbortHandler(promise, onAbort);
    });
    continuablePromiseMap.set(promise, continuablePromise);
  }
  return continuablePromise;
};

type Options = Parameters<typeof useStore>[0] & {
  delay?: number;
  unstable_promiseStatus?: boolean;
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
  const { delay, unstable_promiseStatus: promiseStatus = !React.use } =
    options || {};
  const store = useStore(options);

  const [[valueFromReducer, storeFromReducer, atomFromReducer], rerender] =
    useReducer<readonly [Value, Store, typeof atom], undefined, []>(
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

  useEffect(() => {
    const unsub = store.sub(atom, () => {
      if (promiseStatus) {
        try {
          const value = store.get(atom);
          if (isPromiseLike(value)) {
            attachPromiseStatus(
              createContinuablePromise(value, () => store.get(atom)),
            );
          }
        } catch {
          // ignore
        }
      }
      if (typeof delay === 'number') {
        // delay rerendering to wait a promise possibly to resolve
        setTimeout(rerender, delay);
        return;
      }
      rerender();
    });
    rerender();
    return unsub;
  }, [store, atom, delay, promiseStatus]);

  useDebugValue(value);
  if (isPromiseLike(value)) {
    const promise = createContinuablePromise(value, () => store.get(atom));
    if (promiseStatus) {
      attachPromiseStatus(promise);
    }
    return promise;
  }
  return value;
}
