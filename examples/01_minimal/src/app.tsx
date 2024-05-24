import { Suspense } from 'react';
import { useAtom } from 'jotai/react';
import { atom } from 'jotai/vanilla';
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

export default App;
