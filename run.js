import { readFile, writeFile, glob } from './utils';

glob('input/*.txt')
  .then((files) => {
    console.log(files);
  });
