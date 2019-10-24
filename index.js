/* eslint-disable no-console */

const {
  countAllOpenMazes,
} = require('./slices');

[3, 4, 5, 6].forEach((gridSize) => {
  console.time(`time ${gridSize}`);

  const totalCount = countAllOpenMazes(gridSize);
  console.log(`${gridSize}x${gridSize}`, totalCount);

  console.timeEnd(`time ${gridSize}`);
});
