// See: https://github.com/pmndrs/jotai/discussions/2007
import { describe, it } from 'vitest';
import { Suspense, StrictMode } from 'react';
import { useAtomValue } from 'jotai/react';
import { atomWithObservable } from 'jotai/vanilla/utils';
import { Subject, map } from 'rxjs';
import { act, fireEvent, render } from '@testing-library/react';
import { usePrepareAtoms } from 'jotai-suspense';

describe('usePrepareAtoms w/ useObservable spec', () => {
  it('writable count state without initial value and rxjs chain', async () => {
    const single$ = new Subject<number>();
    const double$ = single$.pipe(map((n) => n * 2));
    const singleAtom = atomWithObservable(() => single$);
    const doubleAtom = atomWithObservable(() => double$);

    const CounterValue = () => {
      const single = useAtomValue(singleAtom);
      const double = useAtomValue(doubleAtom);

      return (
        <>
          single: {single}, double: {double}
        </>
      );
    };

    const CounterButton = () => {
      return (
        <button type="button" onClick={() => single$.next(2)}>
          button
        </button>
      );
    };

    const Prepare = () => {
      usePrepareAtoms([singleAtom, doubleAtom]);
      return null;
    };

    const { findByText, getByText } = render(
      <StrictMode>
        <Prepare />
        <Suspense fallback="loading">
          <CounterValue />
        </Suspense>
        <CounterButton />
      </StrictMode>,
    );

    await findByText('loading');

    fireEvent.click(getByText('button'));
    await findByText('single: 2, double: 4');

    act(() => single$.next(3));
    await findByText('single: 3, double: 6');
  });
});
