desc('Runs commands');
task('exec', { async: true }, (...cmd) => {
  jake.exec(cmd, () => complete(), { interactive: true });
});

desc('Runs commands silently');
task('silent', { async: true }, (...cmd) => {
  jake.exec(cmd, () => complete(), { interactive: false });
});

desc('A single command run that will always exit with code 0');
task('zero', { async: true }, (cmd, silent) => {
  jake.exec(cmd, () => complete(), {
    interactive: !silent,
    breakOnError: false
  });
});
