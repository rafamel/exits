import reset, { cloned } from '../reset-store';
import store from '~/store';
import setState from '~/utils/set-state';
import logger from '~/logger';
import { TTriggered } from '~/types';

logger.setLevel('silent');

test(`updates state key`, async () => {
  expect.assertions(1);
  reset();

  const update = {
    signal: true,
    exception: false,
    rejection: false,
    exit: true
  };
  await setState({ attached: update });

  expect(store.state).toEqual({
    ...cloned.state,
    attached: update
  });
});

test(`updates state keys`, async () => {
  expect.assertions(1);
  reset();

  const attached = {
    signal: true,
    exception: false,
    rejection: false,
    exit: true
  };
  await setState({ attached });
  const triggered: TTriggered = { type: 'signal', arg: 'SIGINT' };
  await setState({ triggered, done: true });

  expect(store.state).toEqual({
    attached,
    triggered,
    done: true
  });
});

test(`doesn't reject for non existent prop`, async () => {
  expect.assertions(1);
  reset();

  // @ts-ignore
  await expect(setState({ hello: 1 })).resolves.toBeUndefined();
});

test(`calls subscribers for first level updated props (async)`, async () => {
  expect.assertions(2);
  reset();

  const arr: number[] = [];
  store.subscribers = {
    attached: [() => arr.push(1), () => arr.push(2), () => arr.push(3)],
    triggered: [() => arr.push(4), () => arr.push(5)],
    done: [() => arr.push(6), () => arr.push(7)]
  };

  const attached = {
    signal: true,
    exception: false,
    rejection: false,
    exit: true
  };
  await setState({ attached });
  expect(arr).toEqual([1, 2, 3]);

  const triggered: TTriggered = { type: 'signal', arg: 'SIGINT' };
  await setState({ triggered, done: true });

  expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test(`doesn't reject & continues throwing/rejecting subscriber`, async () => {
  expect.assertions(1);
  reset();

  const arr: number[] = [];
  store.subscribers = {
    ...store.subscribers,
    done: [
      () => arr.push(1),
      () => Promise.reject(Error()),
      () => {
        throw Error();
      },
      () => arr.push(2)
    ]
  };

  await setState({ done: true });
  expect(arr).toEqual([1, 2]);
});
