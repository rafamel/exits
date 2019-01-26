const TAG = '__cmdArg__:';
const SPACE = ':__SPACE__:';

const rgxTag = new RegExp('^' + TAG);
const rgxSpace = new RegExp(SPACE, 'g');
export default {
  set(argv = process.argv): string[] {
    const separator = argv.lastIndexOf('--');
    if (separator === -1) return argv;

    return argv
      .slice(0, separator)
      .concat(
        TAG + JSON.stringify(argv.slice(separator + 1)).replace(/ /g, SPACE)
      );
  },
  get(argv = process.argv): string[][] {
    let index = -1;
    for (let i = 0; i < argv.length; i++) {
      if (rgxTag.exec(argv[i])) {
        index = i;
        break;
      }
    }
    return index === -1
      ? [argv, []]
      : [
          argv.slice(0, index).concat(argv.slice(index + 1)),
          JSON.parse(argv[index].replace(rgxTag, '').replace(rgxSpace, ' '))
        ];
  }
};
