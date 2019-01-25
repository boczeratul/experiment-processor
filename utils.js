import fs from 'fs';
import nodeGlob from 'glob';

const animateProgress = require('./helpers/progress');
const addCheckmark = require('./helpers/checkmark');

export const readFile = fileName =>
  new Promise((resolve, reject) => {
    fs.readFile(
      fileName,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

export const writeFile = (fileName, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(
      fileName,
      data,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

export const glob = pattern =>
  new Promise((resolve, reject) => {
    nodeGlob(
      pattern,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

// Progress Logger
export const task = (message) => {
  const progress = animateProgress(message);
  process.stdout.write(message);

  return (error) => {
    if (error) {
      process.stderr.write(error);
    }
    clearTimeout(progress);
    return addCheckmark(() => process.stdout.write('\n'));
  };
};
