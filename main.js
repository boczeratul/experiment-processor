import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { sync as rmdirSync } from 'rimraf';

import { glob } from './utils';
import checkmark from './helpers/checkmark';
import xmark from './helpers/xmark';

let totalCount = 0;
const completeData = {
  Ch1: {
    '0.1-0.2': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
    '0.2-0.4': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
  },
  Ch2: {
    '0.1-0.2': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
    '0.2-0.4': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
  },
  Ch3: {
    '0.1-0.2': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
    '0.2-0.4': {
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    },
  },
};

const print = message =>
  process.stdout.write(message);

// const print = () => {};

const printFile = file =>
  print(`\n\nProcessing ${file}`);

const printStep = step =>
  print(`\n  ${step}`);

const discardFile = (file, dest, reason) => {
  print(` - ${reason}`);
  xmark();
  copyFileSync(file, dest, { flag: 'w+' });
};

const manualCheck = (file, data) => {
  print(' - manual check');
  checkmark();
  const [, channel, serial] = file.split('/');
  writeFileSync(`@OUTPUTS/${channel}/unknown/${serial}`, data, { flag: 'w+' });
};

const allZero = (row) => {
  const [col0, col1, col2] = row.split('\t');

  return col0 === '0' && col1 === '0' && col2 === '0';
};

const formatCells = row =>
  `=TRANSPOSE(SPLIT("${row.split(':\t')[1].split('\t').join(',')}", ","))`;

const processFile = (file) => {
  printFile(file);

  const [, channel, serial] = file.split('/');
  const data = readFileSync(file).toString('utf8');
  const lines = data.split('\n');

  // Check file
  printStep('Checking file content');

  if (!lines) {
    return discardFile(file, `@OUTPUTS/${channel}/0-state/${serial}`, 'invalid file or empty file');
  }

  checkmark();

  // Check dwells
  printStep('Checking dwells');

  if (!lines[4] || !lines[5]) {
    return discardFile(file, `@OUTPUTS/${channel}/0-state/${serial}`, 'cannot identify dwells');
  }

  if (lines[6] !== '') {
    if (allZero(lines[4]) || allZero(lines[5]) || allZero(lines[6])) {
      return manualCheck(file, data);
    }

    return discardFile(file, `@OUTPUTS/${channel}/3-state/${serial}`, 'too many states');
  }

  const dwells = Math.min(
    Number(lines[4].split('\t')[1]),
    Number(lines[5].split('\t')[0]),
  );

  if (dwells < 2 || dwells > 7) {
    return discardFile(file, `@OUTPUTS/${channel}/2-state/invalid-dwells/${serial}`, `dwells out of range (${dwells})`);
  }

  checkmark();

  // Check distance
  printStep('Checking distance');

  const distance = Number(lines[20].split('\t')[0]);

  if (distance < 0.1 || distance > 0.4) {
    return discardFile(file, `@OUTPUTS/${channel}/2-state/invalid-distance/${serial}`, `distance out of range (${distance})`);
  }

  checkmark();

  const distanceGroup = distance < 0.2 ? '0.1-0.2' : '0.2-0.4';
  completeData[channel][distanceGroup][dwells].push({
    dwells,
    distance,
    'State #1 to #2': formatCells(lines[24]),
    'State #2 to #1': formatCells(lines[25]),
  });

  copyFileSync(file, `@OUTPUTS/${channel}/2-state/${distanceGroup}/${dwells}/${serial}`, { flag: 'w+' });
  totalCount += 1;
};

glob('@INPUTS/**/*.txt')
  .then((files) => {
    process.stdout.write(`Processing ${files.length} input files:\n`);

    rmdirSync('@OUTPUTS');
    mkdirSync('@OUTPUTS');
    ['Ch1', 'Ch2', 'Ch3']
      .forEach((channel) => {
        mkdirSync(`@OUTPUTS/${channel}`);
        mkdirSync(`@OUTPUTS/${channel}/0-state`);
        mkdirSync(`@OUTPUTS/${channel}/3-state`);
        mkdirSync(`@OUTPUTS/${channel}/unknown`);
        mkdirSync(`@OUTPUTS/${channel}/2-state`);
        mkdirSync(`@OUTPUTS/${channel}/2-state/invalid-dwells`);
        mkdirSync(`@OUTPUTS/${channel}/2-state/invalid-distance`);
        mkdirSync(`@OUTPUTS/${channel}/2-state/0.1-0.2`);
        mkdirSync(`@OUTPUTS/${channel}/2-state/0.2-0.4`);
        [2, 3, 4, 5, 6, 7]
          .forEach((dwells) => {
            mkdirSync(`@OUTPUTS/${channel}/2-state/0.1-0.2/${dwells}`);
            mkdirSync(`@OUTPUTS/${channel}/2-state/0.2-0.4/${dwells}`);
          });
      });

    files.forEach(processFile);

    const completeFormatted = JSON.stringify(completeData, null, 2);
    writeFileSync('@OUTPUTS/complete.txt', completeFormatted.replace(/\\/g, ''), { flag: 'w+' });

    process.stdout.write(`\nProcessed ${totalCount} files`);
  });
