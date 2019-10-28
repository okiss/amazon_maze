/* eslint-disable no-console,no-plusplus,no-continue */
const createMazeFromPath = (size, adjList, path) => {
  const maze = Array.from({ length: size * size }).fill('0');
  const free = Array.from({ length: size * size }).fill('1');
  for (let i = 0; i < path.length - 1; i++) {
    const v1 = path[i];
    const v2 = path[i + 1];

    const { square, wall } = adjList[v1][v2];
    const [y, x] = square;
    maze[Number(y) * size + Number(x)] = wall;
    free[Number(y) * size + Number(x)] = '0';
  }
  return {
    maze: parseInt(maze.join(''), 2),
    free: parseInt(free.join(''), 2),
  };
};

function generateMazesFromWildcards(size, addMaze, { maze, free }) {
  if (free === 0) {
    addMaze(maze);
    return;
  }

  const wildcard = 2 ** Math.floor(Math.log2(free));
  const newMaze = Math.floor(maze / (wildcard * 2)) * wildcard * 2 + (maze % wildcard);
  const newFree = free - wildcard;

  generateMazesFromWildcards(
    size,
    addMaze,
    { maze: newMaze + wildcard, free: newFree },
  );
  generateMazesFromWildcards(
    size,
    addMaze,
    { maze: newMaze, free: newFree },
  );
}

const countAllPossibleMazes = (size, mazeList) => {
  const mazeStorage = new Set();

  const addMaze = (maze) => {
    mazeStorage.add(maze);
  };

  for (let i = 0; i < mazeList.length; i++) {
    generateMazesFromWildcards(size, addMaze, mazeList[i]);
  }

  return mazeStorage;
};

const countOpenGrids = (size, adjList, openPaths) => {
  const mazeList = openPaths
    .map((path) => createMazeFromPath(size, adjList, path));
  return countAllPossibleMazes(size, mazeList);
};

module.exports = {
  countOpenGrids,
};
