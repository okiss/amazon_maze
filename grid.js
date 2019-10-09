const { findAllOpenPaths } = require('./graph');

const createMazeFromPath = (size, adjList, path) => {
  const maze = Array.from({ length: size * size }).fill('x');
  for (let i = 0; i < path.length - 1; i++) {
    const v1 = path[i];
    const v2 = path[i + 1];

    const { square, wall } = adjList[v1][v2];
    const [y, x] = square;
    maze[Number(y) * size + Number(x)] = wall;
  }
  return maze.join('');
};

function* generateMazesFromWildcards(maze) {
    const wildcardIndex = maze.indexOf('x');
    if (wildcardIndex === -1) {
      yield maze;
      return;
    }
  yield* generateMazesFromWildcards(maze.slice(0, wildcardIndex) + '+' + maze.slice(wildcardIndex + 1))
  yield* generateMazesFromWildcards(maze.slice(0, wildcardIndex) + '-' + maze.slice(wildcardIndex + 1))
}

const getAllPossibleMazes = (mazeList) => {
  const set = []; //new Set();
  mazeList.forEach((possibleMaze) => {
    for (maze of generateMazesFromWildcards(possibleMaze)) {
      set.push(maze);
    }
  })
  return set;
}

// const squaresUsedByPath = (adjList, path) => {
//   const usedSquares = [];
//   for (let i = 0; i < path.length - 1; i++) {
//     const v1 = path[i];
//     const v2 = path[i + 1];

//     const square = adjList[v1][v2];
//     if (!usedSquares.includes(square)) {
//       usedSquares.push(square);
//     }
//   }
//   return usedSquares;
// }

// const countOpenGrids = (size, adjList, vertexList) => {
//   const openPaths = [...findAllOpenPaths(adjList, vertexList)];

//   const totalGridCount = openPaths.reduce((count, path) => {
//     const usedSquareCount = squaresUsedByPath(adjList, path).length;
//     const availableSquareCount = size * size;

//     return count + 2 ** (availableSquareCount - usedSquareCount); 
//   }, 0);

//   return totalGridCount;
// }

module.exports = {
  // squaresUsedByPath,
  // countOpenGrids,
  createMazeFromPath,
  getAllPossibleMazes
};
