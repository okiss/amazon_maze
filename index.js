/* eslint-disable no-console */

const {
  constructGraph,
  findAllOpenPaths,
} = require('./graph');
const {
  countOpenGrids,
} = require('./grid');

console.log('Calculate smaller grids correctly:');
[3, 4, 5].forEach((gridSize) => {
  const { size, adjList, vertexList } = constructGraph(gridSize);

  const openPaths = [...findAllOpenPaths(adjList, vertexList)];
  const totalCount = countOpenGrids(size, adjList, openPaths, { precise: true });

  console.log(`${size}x${size}`, totalCount);
});

console.log('Calculate 6x6 grid incorrectly but quickly :) :');
[6].forEach((gridSize) => {
  const { size, adjList, vertexList } = constructGraph(gridSize);

  const openPaths = [...findAllOpenPaths(adjList, vertexList)];
  const totalCount = countOpenGrids(size, adjList, openPaths, { precise: false });

  console.log(`${size}x${size}`, totalCount);
});
