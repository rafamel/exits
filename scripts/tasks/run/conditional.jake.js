desc('Conditional command run');
task(
  'conditional',
  { async: true },
  async (message, cmdTrue, cmdFalse, defaultOption = 'y', timeout) => {
    isTrue = (x) => {
      if (!x) x = defaultOption;
      return x.toLowerCase() === 'y' || x.toLowerCase() === 'yes';
    };

    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding('utf8');

    let listener;
    const promise = new Promise((resolve) => {
      process.stdout.write(
        message +
          ' [' +
          (timeout ? timeout + 's timeout, ' : '') +
          (isTrue() ? 'Y/n' : 'y/N') +
          ']: ',
        'utf8'
      );
      listener = (key) => resolve(key);
      stdin.addListener('data', listener);
    });

    let res = await (timeout
      ? new Promise((resolve) => {
          setTimeout(() => resolve(''), timeout * 1000);
          promise.then(resolve);
        })
      : promise);
    res = res.replace(/\n/, '').trim();

    const is = isTrue(res);
    const cmd = is ? cmdTrue : cmdFalse;

    if (!cmd) process.exit();
    else {
      console.log(`\nExecuting (${is ? 'Y' : 'N'}):`, cmd);
      jake.exec(cmd, () => process.exit(), { interactive: true });
    }
  }
);
