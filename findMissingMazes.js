/* eslint-disable no-console, no-restricted-syntax */

const {
  findAllOpenMazes,
} = require('./tunnelsAllMazes');
const {
  constructGraph,
  findAllOpenPaths,
} = require('./graph');
const {
  countOpenGrids,
} = require('./grid');

function* findMissingMazes(size) {
  const tunnelMazes = findAllOpenMazes(size)
    .map((maze) => {
      const negated = maze.join('').replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1');
      return parseInt(negated, 2);
    })
    .sort((a, b) => a - b);

  const { adjList, vertexList } = constructGraph(size);
  const paths = [...findAllOpenPaths(adjList, vertexList)];
  const allMazes = countOpenGrids(size, adjList, paths);

  const readableMaze = (maze) => {
    const m = maze.toString(2).padStart(size * size, '0');
    return m.replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1');
  };

  for (const maze of allMazes) {
    if (!tunnelMazes.includes(maze)) {
      yield readableMaze(maze);
    }
  }
}

const printMissingMazes = (size) => {
  for (const maze of findMissingMazes(size)) {
    console.log(maze);
  }
};

module.exports = {
  printMissingMazes,
};
