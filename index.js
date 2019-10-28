/* eslint-disable no-console */

const {
  countAllOpenMazes: tunnelMethod,
  exampleMaze,
} = require('./tunnels');
const {
  countAllOpenMazes: maartenMethod,
} = require('./maarten');
const {
  printMissingMazes,
} = require('./findMissingMazes');

[3, 4, 5, 6].forEach((gridSize) => {
  const totalCount = tunnelMethod(gridSize);
  console.log(`${gridSize}x${gridSize} tunnel`, totalCount);
});

[3, 4, 5, 6].forEach((gridSize) => {
  const totalCount = maartenMethod(gridSize);
  console.log(`${gridSize}x${gridSize} maarten`, totalCount);
});

exampleMaze();

// printMissingMazes(5);
