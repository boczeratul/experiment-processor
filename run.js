const fs = require('fs');
const nodeGlob = require('glob');

const readFile = fileName =>
  new Promise((resolve, reject) => {
    fs.readFile(
      fileName,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

const writeFile = (fileName, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(
      fileName,
      data,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

const glob = pattern =>
  new Promise((resolve, reject) => {
    nodeGlob(
      pattern,
      (error, value) => (error ? reject(error) : resolve(value)),
    );
  });

glob('input/*.txt')
  .then(files => console.log(files));
