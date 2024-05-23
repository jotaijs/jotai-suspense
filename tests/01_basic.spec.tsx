import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { Suspense } from 'react';
import { useAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
import { usePrepareAtoms } from 'jotai-suspense';

describe('usePrepareAtoms spec', () => {
  it('one atom', async () => {
    let started = false;
    const dataAtom = atom(async () => {
      started = true;
      await new Promise((r) => {
        setTimeout(r, 500);
      });
      return 1;
    });
    const derivedAtom = atom((get) => {
      if (!started) {
        throw new Error('should have started');
      }
      return get(dataAtom);
    });
    const Component = () => {
      const [data] = useAtom(derivedAtom);
      return <div>count: {data}</div>;
    };
    const Main = () => {
      usePrepareAtoms([dataAtom]);
      return (
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      );
    };

    const { findByText } = render(
      <div>
        <Main />
      </div>,
    );

    await findByText('count: 1');
  });
});
