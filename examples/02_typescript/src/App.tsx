import React, { Suspense, useState } from 'react';
import { Provider, atom, useAtom } from 'jotai';
import { usePrepareAtoms } from 'jotai-suspense';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const fooAtom = atom(async () => {
  await sleep(3000);
  return 'foo';
});

const barAtom = atom(async () => {
  await sleep(3000);
  return 'bar';
});

const Foo = () => {
  const [foo] = useAtom(fooAtom);
  return <div>Foo: {foo}</div>;
};

const Bar = () => {
  const [bar] = useAtom(barAtom);
  return (
    <div>
      <Foo />
      <div>Bar: {bar}</div>
    </div>
  );
};

const MainWithPrepareAtoms = () => {
  usePrepareAtoms([fooAtom, barAtom]);
  return <Bar />;
};

const MainWithoutPrepareAtoms = () => {
  return <Bar />;
};

const AppWithPrepareAtoms = () => (
  <Provider>
    <Suspense fallback="Loading...">
      <MainWithPrepareAtoms />
    </Suspense>
  </Provider>
);

const AppWithoutPrepareAtoms = () => (
  <Provider>
    <Suspense fallback="Loading...">
      <MainWithoutPrepareAtoms />
    </Suspense>
  </Provider>
);

const App = () => {
  const [show, setShow] = useState(false);
  return (
    <div>
      {show ? (
        <div>
          <h1>With usePrepareAtoms</h1>
          <AppWithPrepareAtoms />
          <h1>Without usePrepareAtoms</h1>
          <AppWithoutPrepareAtoms />
        </div>
      ) : (
        <button type="button" onClick={() => setShow(true)}>
          Start
        </button>
      )}
    </div>
  );
};

export default App;
