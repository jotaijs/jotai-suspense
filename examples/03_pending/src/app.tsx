import { Suspense } from 'react';
import { Provider, useSetAtom, useAtomValue } from 'jotai/react';
import { atomWithPending } from 'jotai-suspense';

const workAtom = atomWithPending<string>();

const WorkController = () => {
  const done = useSetAtom(workAtom);
  return (
    <>
      <button type="button" onClick={() => done('success')}>
        success
      </button>
      <button type="button" onClick={() => done('fail')}>
        fail
      </button>
    </>
  );
};

const WorkStatus = () => {
  const status = useAtomValue(workAtom);
  return <>Work is done with {status}.</>;
};

const Work = () => {
  return (
    <>
      <WorkController />
      <Suspense fallback="Work in progress...">
        <WorkStatus />
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <Provider>
      <Work />
    </Provider>
  );
};

export default App;
