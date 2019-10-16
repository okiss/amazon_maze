/* eslint-disable no-console,no-plusplus,no-continue */
const { countAllSimpleMazes } = require('./slices');

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
  const mazeStorage = {};
  let isEmpty = true;

  const addMaze = (maze) => {
    isEmpty = false;
    const slices = [];
    for (let i = 0; i < size; i++) {
      const shift = (size - i - 1) * size;
      slices.push(Math.floor(maze / 2 ** shift));
      maze %= (2 ** shift); // eslint-disable-line
    }

    let partialPath = mazeStorage;
    for (let i = 0; i < size; i++) {
      if (!partialPath[slices[i]]) {
        partialPath[slices[i]] = {};
      }
      partialPath = partialPath[slices[i]];
    }
  };

  const countLeaves = (tree) => {
    const nodes = Object.keys(tree);
    if (nodes.length === 0) {
      return 1;
    }
    return nodes.reduce((count, node) => count + countLeaves(tree[node]), 0);
  };

  for (let i = 0; i < mazeList.length; i++) {
    generateMazesFromWildcards(size, addMaze, mazeList[i]);
  }

  return isEmpty ? 0 : countLeaves(mazeStorage);
};

const squaresUsedByPath = (adjList, path) => {
  const usedSquares = [];
  const ret = [];
  for (let i = 0; i < path.length - 1; i++) {
    const v1 = path[i];
    const v2 = path[i + 1];

    const square = adjList[v1][v2];
    if (!usedSquares.includes(square.square)) {
      usedSquares.push(square.square);
      ret.push(square);
    }
  }
  return ret;
};

const findSimplePaths = (size, usedSquares) => usedSquares
  .filter(({ squares }) => {
    for (let i = 0; i < size; i++) {
      if (squares.filter(({ square: [row] }) => Number(row) === i).length !== 2) {
        return false;
      }
    }
    return true;
  })
  .map(({ index }) => index);

const findPossibleConflicts = (size, usedSquares, simplePaths) => usedSquares
  .filter(({ squares, index }) => {
    if (simplePaths.includes(index)) {
      return false;
    }
    const columns = squares.map(({ square: [, column] }) => column);
    return (Math.min(...columns) !== 0 || Math.max(...columns) !== size - 1);
  })
  .map(({ index }) => index);

const countOpenGrids = (size, adjList, openPaths) => {
  const usedSquaresList = openPaths
    .map((path, index) => ({ squares: squaresUsedByPath(adjList, path), index }));

  const simplePaths = findSimplePaths(size, usedSquaresList);

  const conflictingPaths = findPossibleConflicts(size, usedSquaresList, simplePaths);

  const mazeList = openPaths
    .filter((_, i) => conflictingPaths.includes(i))
    .map((path) => createMazeFromPath(size, adjList, path));
  const conflictingPathsMazeCount = countAllPossibleMazes(size, mazeList);

  const simplePathsMazeCount = countAllSimpleMazes(size);

  let freeSquaresMazeCount = 0;
  for (let i = 0; i < openPaths.length; i++) {
    if (simplePaths.includes(i) || conflictingPaths.includes(i)) {
      continue;
    }

    const usedSquareCount = squaresUsedByPath(adjList, openPaths[i]).length;
    const availableSquareCount = size * size;

    freeSquaresMazeCount += 2 ** (availableSquareCount - usedSquareCount);
  }

  console.log('simple mazes from slices: ', simplePathsMazeCount);
  console.log(
    'simple mazes from generating all mazes: ',
    countAllPossibleMazes(
      size,
      openPaths
        .filter((_, i) => simplePaths.includes(i))
        .map((path) => createMazeFromPath(size, adjList, path)),
    ),
  );

  return freeSquaresMazeCount + conflictingPathsMazeCount + simplePathsMazeCount;
};

module.exports = {
  countOpenGrids,
};
