import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { atom, useAtom } from 'jotai';
import { usePrepareAtoms } from 'jotai-suspense';

const sleep = (ms) =>
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

const Main = () => {
  usePrepareAtoms([fooAtom, barAtom]);
  return <Bar />;
};

const App = () => {
  return (
    <Suspense fallback="Loading...">
      <Main />
    </Suspense>
  );
};

createRoot(document.getElementById('app')).render(<App />);
