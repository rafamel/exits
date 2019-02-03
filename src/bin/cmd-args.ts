export default function cmdArgs(
  argv: string[],
  { first = true } = {}
): string[][] {
  const separator = first ? argv.indexOf('--') : argv.lastIndexOf('--');
  if (separator === -1) return [argv, []];

  return [argv.slice(0, separator), argv.slice(separator + 1)];
}
