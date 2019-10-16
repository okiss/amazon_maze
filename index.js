/* eslint-disable no-console */

const {
  constructGraph,
  findAllOpenPaths,
} = require('./graph');
const {
  countOpenGrids,
} = require('./grid');

[3, 4, 5].forEach((gridSize) => {
  const { size, adjList, vertexList } = constructGraph(gridSize);

  const openPaths = [...findAllOpenPaths(adjList, vertexList)];
  const totalCount = countOpenGrids(size, adjList, openPaths);

  console.log(`${size}x${size}`, totalCount);
});
