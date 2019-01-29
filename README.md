# exits

[![Version](https://img.shields.io/npm/v/exits.svg)](https://www.npmjs.com/package/exits)
[![Types](https://img.shields.io/npm/types/exits.svg)](https://www.npmjs.com/package/exits)
[![Build Status](https://img.shields.io/travis/rafamel/exits.svg)](https://travis-ci.org/rafamel/exits)
[![Coverage](https://img.shields.io/coveralls/rafamel/exits.svg)](https://coveralls.io/github/rafamel/exits)
[![Dependencies](https://img.shields.io/david/rafamel/exits.svg)](https://david-dm.org/rafamel/exits)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/exits.svg)](https://snyk.io/test/npm/exits)
[![License](https://img.shields.io/github/license/rafamel/exits.svg)](https://github.com/rafamel/exits/blob/master/LICENSE)

<!-- markdownlint-disable MD036 -->
**Run arbitrary functions & commands asynchronously before process termination, programatically or via CLI.**
<!-- markdownlint-enable MD036 -->

`exits` can conditionally intercept signals (`'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'`, `'SIGTERM'`), `uncaughtException`s, `unhandledRejection`s, or end of execution (`beforeExit`) on Node.

The only instance in which it will not be able to complete work scheduled via [`add()`](#addcb-function-priority-number--null-opts-object-function) before end of execution is [if `process.exit()` or `SIGKILL` -meant to terminate the process forcefully- are explicitly called.](#forceful-process-termination)

It can also be used as an executable, allowing you to run a command after a previous one exits, regardless of the cause.

## Install

[`npm install exits`](https://www.npmjs.com/package/exits)

If global CLI usage is intended, you can install globally by running: `npm install -g exits`.

## CLI

<!-- markdownlint-disable MD040 MD031 -->
```
Run a command after a main command terminates.

Usage: exits [options] <mainCmd> <...mainArgs> -- <afterCmd> <...afterArgs>

Options:
  --stdio <stdio>
        stdio options to spawn children processes with.
        Can be inherit, pipe, ignore, or a comma separated combination for stdin,stdout,stderr.
        Default: inherit.
        Example: --stdio pipe,inherit,inherit
  --at <at>
        In which termination cases of the main process should the after command run.
        Can be signal, error, success, or a comma separated combination of those.
        Default: signal,error,success.
        Example: --at signal,error
  --log <level>
        Logging level, one of trace, debug, info, warn, error, or silent.
        Default: warn
        Example: --logger info
  -h, --help       output usage information
  -V, --version    output the version number
```
<!-- markdownlint-enable MD040 MD031 -->

## Programatic Usage

* [`attach()`](#attachopts-object-void) starts listening to termination events.
* [`unattach()`](#unattachopts-object-void) stops listening to termination events.
* [`add()`](#addcb-function-priority-number--null-opts-object-function) adds and removes tasks to be run on listened to events before termination.
* [`clear()`](#clear-void) removes all added tasks.
* [`options()`](#optionsopts-object-void) sets `exits` options.
* [`state()`](#state-object) returns an *object* with the current `exits` state.
* [`on()`](#onevent-string-cb-function-void) subscribes to state changes.
* [`control()`](#controlfn-generator-promiseany`) controls *async* execution flow in order to stop parallel execution on triggered termination events.
* [`terminate()`](#terminatetype-string-arg-string--error--number-promisevoid) explicitly terminates execution while still waiting for `exits` tasks to finish.
* [`spawn()`](#spawncmd-string-args-string-opts-object-object) safely handles execution of child processes.

### Basic usage

```javascript
import { attach, add } from 'exits';

// By default, attach() will intercept signals, exceptions,
// unhandled rejections, and end of execution events.
// Once we call attach, all hooks added via add() will execute before
// process termination.
attach();

// We can add() before or after we call attach(). Just keep in
// mind only after attach() is called will we intercept process termination.
// add() can be passed a sync or an async function.
add(async () => {
  // Do any async op.
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Second task has finished');
});

// Tasks added via add() execute serially
// in reverse order of addition by default (LIFO).
add(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('First task has finished');
});
```

### `attach(opts?: object): void`

Starts listening to termination events. By default, `attach()` will listen to all available events. Calling `attach()` several times will have no effect if a particular event is already being listened for.

* `opts`: *Object, optional* with keys:
  * `signal`: *boolean;* default: `true`. Whether to listen to and intercept `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'`, and `'SIGTERM'` events.
  * `exception`: *boolean;* default: `true`. Whether to listen to and intercept `uncaughtException` (errors).
  * `rejection`: *boolean;* default: `true`. Whether to listen to and intercept `unhandledRejection` (unhandled promise rejections).
  * `exit`: *boolean;* default: `true`. Whether to listen to and intercept `beforeExit`.

```javascript
import { attach } from 'exits';

// In order to listen to all events we just do:
attach();

// These are all equivalent
attach();
attach({ signal: true, rejection: true });
attach({ signal: true, exception: true, rejection: false, exit: true });

// If we wanted to listen ONLY to exceptions
// we'd do either of these (they are equivalent):
attach({ signal: false, rejection: false, exit: false });
attach({ signal: false, exception: true, rejection: false, exit: false });
```

### `unattach(opts?: object): void`

Stop listening to all or some termination events. By default, it will stop listening to all currently being listened to. It will only have effect if we are currently listening to some or all of the events passed. It will be automatically called when all tasks have run in order to allow for process exit.

* `opts`:
  * `signal`: *boolean;* default: `true`.
  * `exception`: *boolean;* default: `true`.
  * `rejection`: *boolean;* default: `true`.
  * `exit`: *boolean;* default: `true`.

```javascript
import { unattach } from 'exits';

// Stop listening to all
unattach();

// Stop listening only to exceptions
unattach({ signal: false, rejection: false, exit: false });
```

### `add(cb: function, priority?: number | null, opts?: object): function`

Adds a task to be run on [`attach()`ed](#attachopts-object-void) events. Returns a removal *function.*

* `cb`: *function* for the task to run on the `attach()`ed events, with signature (can be *async*): `(type: string, arg: any, context: any) => Promise<void> | void`:
  * if `type` is `'signal'`, `arg` will be any of `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'`, `'SIGTERM'`.
  * if `type` is either `'exception'` or `'rejection'`, `arg` will be an *Error*.
  * if `type` is `'exit'`, `arg` will be the exit code *number*.
  * `context` is an initially empty object that is passed to all tasks. Tasks can share state by mutating the object.
* `priority`: *number | null;* default: `0`. For an equal priority, tasks added via `add()` will execute serially, in reverse order of addition (LIFO). Tasks with higher (larger) priority will always execute first.
* `opts`: A task can be marked to apply only for some cases. This would allow, as an example, to only run certain tasks if the process throws an exception, others, if the process is terminated via signal, and others in all cases. It will only act for signals that have been `attach()`ed.
  * `signal`: *boolean;* default: `true`.
  * `exception`: *boolean;* default: `true`.
  * `rejection`: *boolean;* default: `true`.
  * `exit`: *boolean;* default: `true`.

```javascript
import { add } from 'exits';

// Some cleanup task that won't run on signals ('SIGINT',
// 'SIGHUP', 'SIGQUIT', 'SIGTERM')
add(async (type, arg, context) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Cleanup is done');
}, null, { signal: false });

// We'll add a task and then remove it.
const remove = add(() => {
  // Some task...
});
remove();
```

### `clear(): void`

Removes all tasks scheduled via [`add()`.](#addcb-function-priority-number--null-opts-object-function) If run inside a task, it will prevent any other following task from executing.

```javascript
import { clear } from 'exits';

clear();
```

### `options(opts?: object): void`

Sets `exits` global options.

* `opts`: *object,* with optional properties:
  * `logger`: *string,* any of `'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, `'silent'`. Sets `exits` logging level. Default: `'warn'`.
  * `spawned`: *object,* determines `exits` behavior in relation to spawned commands. See [`spawn()`.](#spawncmd-string-args-string-opts-object-object)
  * `resolver`: a [resolver *function*.](#resolver-function)

```javascript
import { options } from 'exits';

options({
  logger: 'debug'
});
```

### `state(): object`

Returns an *object* with the current `exits` state. It will not be mutated on updates, so you need to call `state()` each time you want to check it.

The returned *object* will have properties:

* `attached`: Which events was `exits` attached to via [`attach()`.](#attachopts-object-void) *object,* with keys:
  * `signal`: *boolean*
  * `exception`: *boolean*
  * `rejection`: *boolean*
  * `exit`: *boolean*
* `triggered`: Whether tasks have started running. *null* if not, otherwise an *object* containing information as to the termination event that caused it, with keys:
  * `type`: One of `'signal'`, `'exception'`, `'rejection'`, `'exit'`;
  * `arg`:
    * One of `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'`, `'SIGTERM'` if `type` is `'signal'`.
    * An *Error* if `type` is `'exception'` or `'rejection'`.
    * A *number* if `type` is `exit` signaling the exit code.
* `done`: *boolean,* whether all task calls have run and finished.

```javascript
import { state } from 'exits';

state();
```

Initial state:

```javascript
{
  attached: {
    signal: false,
    exception: false,
    rejection: false,
    exit: false
  },
  triggered: null,
  done: false
}
```

### `on(event: string, cb: function): void`

Subscribes to [`state`](#state-object) changes.

* `event`: *string,* any of:
  * `'attached'`: `cb` will be called whenever the [`attach()`](#attachopts-object-void) method is called and successfully attaches to one or more new events, receiving an *object* with the current attachments, with keys:
    * `signal`: *boolean*
    * `exception`: *boolean*
    * `rejection`: *boolean*
    * `exit`: *boolean*
  * `'triggered'`: `cb` will be called on the first occasion `exits` tasks are called (as the rest are ignored), receiving an *object* as an argument, with keys:
    * `type`: any of `'signal'`, `'exception'`, `'rejection'`, and `'exit'`.
    * `arg`: the signal (`'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'`, `'SIGTERM'`), *Error*, or exit code *number*.
  * `'done'`: `cb` will be called once all `exits` tasks complete.

```javascript
import { on } from 'exits';

on('triggered', ({ type, arg }) => {
  // do something
});
```

### `control(fn: generator): Promise<any>`

Used to control async flow. It might occur that some function throws or reject within your library, hence you'd expect `exits` task to run, but all other ongoing processes to terminate, particularly if doing costly async operations. For that use case, generate will return an *async* function from a *generator*. When the generator is run, it will only continue yielding if `exits` tasks have not been triggered.

```javascript
import { control } from 'exits';

const myAsyncFunction = control(function*(n = 10) {
  // You can use yield as you'd use await; res = 20
  let res = yield Promise.resolve(n * 2);
  // If tasks have been triggered by some event this won't execute
  res = yield Promise.resolve(res * 5);
  // res = 100
  return res;
});

myAsyncFunction(10).then(console.log) // 100
```

### `terminate(type: string, arg: string | Error | number): Promise<void>`

[As any explicit call to `process.exit()` will terminate the process without running `exits` tasks,](#forceful-process-termination) `terminate()` is provided as a replacement for explicit exit calls.

It will manually produce termination any other reason (`'signal'`, `'exception'`, `'rejection'`, or `'exit'`), run all tasks associated with that event as if it was originated otherwise, and call the [resolver *function*.](#resolver-function) with the `type` and `arg` passed.

* `type`: *string,* any of `'exit'`, `'signal'`, `'exception'`, or `'rejection'`.
* `arg`:
  * if `type` is `'signal'`, it should be the signal *string,*
  * if `type` is `'exception'` or `'rejection'`, it should be an *Error,*
  * if `type` is `'exit'`, it should the the exit code *number.*

```javascript
import { terminate } from 'exits';

// This will run all tasks bound to exit and call the resolver
// with type 'exit' and arg 1. The default resolver will
// then exit the process with code 1.
terminate('exit', 1);

// This will run all tasks bound to exception and call the resolver
// with type 'error' and the error as arg. The default resolver will
// then throw the error, which will cause the process to terminate.
terminate('exception', Error('some error'));
```

### `spawn(cmd: string, args?: string[], opts?: object): object`

Spawning child processes in a way that behaves coherently with `exits` tasks is tricky. To simplify it, even while still offering a relatively low level api, `spawn()` is available.

* `cmd`: *string,* a command to run.
* `args`: *string array, optional,* arguments for `cmd`.
* `opts`: *object, optional,* [*Node.js'* `child_process.spawn` options.](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_child_process_spawn_command_args_options)

`spawn()` returns an *object,* with keys:

* `ps`: a *Node.js* [`ChildProcess`.](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_class_childprocess)
* `promise`: a *promise*, that will:
  * *reject:*
    * if the child process terminates on error,
    * if it exits with a code other than *0,*
    * or if it terminates with a signal other than `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'` or `'SIGTERM'`.
  * *resolve:*
    * with a `null` value if the process exits with code *0,*
    * or with any of `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'` or `'SIGTERM'` if the child process terminates on any of those signals.

```javascript
import { spawn } from 'exits';

const { ps, promise } = spawn('echo', ['hello'], { stdio: 'inherit' });
```

The way we deal with spawned processes and `exits` tasks initialization is defined through `spawned` [`options()`:](#optionsopts-object-void).

* `signals`: *string,* whether to stop listening for `'SIGINT'`, `'SIGHUP'`, `'SIGQUIT'` and `'SIGTERM'` signals on the main process while there is a spawned process running. Can be any of:
  * `'all'`: stop listening to signals if there is any spawned process running.
  * `'bind'`: stop listening only if there is at least one [non detached](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_options_detached) spawned process running.
  * `'detached'`: stop listening only if there is at least one [detached](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_options_detached) spawned process running.
  * `'none'`: don't stop listening.
* `wait`: *string,* whether to wait for spawned processes to exit before and after executing `exits` tasks on main process termination. Can be any of:
  * `'all'`: wait for all spawned processes to exit.
  * `'bind'`: wait for all [non detached](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_options_detached) spawned processes to exit.
  * `'detached'`: wait for all [detached](https://nodejs.org/docs/latest-v8.x/api/child_process.html#child_process_options_detached) spawned processes to exit.
  * `'none'`: don't wait for any process to exit.
* `sigterm`: *null* or *number,* timeout in milliseconds before sending a `'SIGTERM'` signal to all waited for processes that haven't exited by then. If `null`, it won't be sent. Only valid when `wait` is not `'none'`.
* `sigkill`: *null* or *number,* timeout in milliseconds before sending a `'SIGKILL'` signal to all waited for processes that haven't exited by then. If `sigterm` is not `null`, it starts counting after the `'SIGTERM'` signal has been sent. If `null`, it won't be sent. Only valid when `wait` is not `'none'`. Bear in mind if processes are waited for and no `'SIGKILL'` is sent, the waiting process might carry on indefinitely if their dueful termination is not handled manually.

**These are the defaults:**

```javascript
import { options } from 'exits';

options({
  spawned: {
    signals: 'bind',
    wait: 'bind',
    sigterm: 5000,
    sigkill: 10000
  }
});
```

### Resolver function

The resolver function gets called whenever `exits` tasks finalize in order to terminate the current process in a way that is coherent with the first event that caused the tasks to initialize. Hence, it takes two arguments: `type` and `arg`, in the same fashion as the [`add()` `cb`.](#addcb-function-priority-number--null-opts-object-function)

You can switch this function globally by passing a resolver key to [`options()`.](#optionsopts-object-void)

**Simplified default implementation:**

```javascript
import { options } from 'exits';

options({
  resolver(type, arg) {
    switch (type) {
      case 'signal':
        return process.kill(process.pid, arg);
      case 'exit':
        return process.exit(Number(arg));
      case 'exception':
      case 'rejection':
        return setImmediate(() => {
          throw arg;
        });
      default:
        return;
    }
  }
});
```

The default resolver is also exported, so you could call it inside a function like so:

```javascript
import { resolver, options } from 'exits';

options({
  resolver(type, arg) {
    if (type === 'rejection') {
      // do something
    }
    return resolver(type, arg);
  }
});
```

### Forceful process termination

There are two instances in which `exits` tasks won't run: when calling `process.exit()` explicitly, and when a `SIGKILL` signal is received. See [`terminate()`.](#terminatetype-string-arg-string--error--number-promisevoid)

```javascript
// This will immediately exit the process with a 0 code
process.exit(0);

// This will terminate the process with a SIGKILL signal
process.kill(process.pid, 'SIGKILL');
```