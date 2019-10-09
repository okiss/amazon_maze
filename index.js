const {
  constructGraph,
  findAllOpenPaths
} = require('./graph');
const {
  createMazeFromPath,
  getAllPossibleMazes
} = require('./grid');
const {
  drawGrids,
  drawSVG
} = require('./drawGrid');

const { size, adjList, vertexList } = constructGraph(6)

const paths = [...findAllOpenPaths(adjList, vertexList)]
const mazes = paths.map(path => createMazeFromPath(size, adjList, path));
const uniqueMazes = getAllPossibleMazes(mazes)

// const svg = drawGrids(size, vertexList, paths, squares)
// console.log(drawSVG(svg));

console.log(uniqueMazes.size);