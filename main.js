import { readFileSync } from 'fs';
import { glob, task } from './utils';

glob('@INPUTS/*.txt')
  .then((files) => {
    const fileTaskDone = task(`Processing ${files.length} input files`);

    files.forEach((file) => {
      const data = readFileSync(file).toString('utf8');
      const lines = data.split('\n');
      console.log(lines);
    });

    fileTaskDone();
  });
