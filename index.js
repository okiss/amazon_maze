/* eslint-disable no-console */

const {
  countAllOpenMazes: tunnelMethod,
} = require('./tunnels');
const {
  countAllOpenMazes: maartenMethod,
  exampleMaze,
} = require('./maarten');

[3, 4, 5, 6].forEach((gridSize) => {
  const totalCount = tunnelMethod(gridSize);
  console.log(`${gridSize}x${gridSize}`, totalCount);
});

// [3, 4, 5].forEach((gridSize) => {
//   const totalCount = maartenMethod(gridSize);
//   console.log(`${gridSize}x${gridSize}`, totalCount);
// });
// exampleMaze();
