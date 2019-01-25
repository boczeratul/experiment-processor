const fs = require('fs');
const nodeGlob = require('glob');

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
