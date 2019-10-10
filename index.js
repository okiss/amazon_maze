const {
  constructGraph,
  findAllOpenPaths
} = require('./graph');
const {
  countOpenGrids
} = require('./grid');

const { size, adjList, vertexList } = constructGraph(6);

const openPaths = [...findAllOpenPaths(adjList, vertexList)];
const totalCount = countOpenGrids(size, adjList, openPaths, vertexList);

console.log(totalCount);