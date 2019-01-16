desc('Runs commands');
task('exec', { async: true }, (...cmd) => {
  jake.exec(cmd, { interactive: true });
});

desc('Runs commands silently');
task('silent', { async: true }, (...cmd) => {
  jake.exec(cmd, { interactive: false });
});
