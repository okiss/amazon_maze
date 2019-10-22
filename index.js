/* eslint-disable no-console */

const {
  countAllOpenMazes,
  applyTunnels
} = require('./slices');

console.time('A');
[3, 4, 5].forEach((gridSize) => {
  const totalCount = countAllOpenMazes(gridSize);

  console.log(`${gridSize}x${gridSize}`, totalCount);
});
console.timeEnd('A');
