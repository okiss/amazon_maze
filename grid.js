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
  const mazeStorage = {};

  const addMaze = (maze) => {
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

  return countLeaves(mazeStorage);
};

const squaresUsedByPath = (adjList, path) => {
  const usedSquares = [];
  for (let i = 0; i < path.length - 1; i++) {
    const v1 = path[i];
    const v2 = path[i + 1];

    const { square } = adjList[v1][v2];
    if (!usedSquares.includes(square)) {
      usedSquares.push(square);
    }
  }
  return usedSquares;
};

const findPossibleConflicts = (size, adjList, openPaths) => openPaths
  .map((path, index) => ({ path, index }))
  .filter(({ path }) => {
    const squares = squaresUsedByPath(adjList, path);
    const minColumn = squares.reduce((min, [, j]) => Math.min(min, j), size - 1);
    const maxColumn = squares.reduce((max, [, j]) => Math.max(max, j), 0);
    return minColumn !== 0 || maxColumn !== size - 1;
  });

const countOpenGrids = (size, adjList, openPaths, { precise }) => {
  const conflictingPaths = precise
    ? findPossibleConflicts(size, adjList, openPaths)
    : [];

  const mazeList = conflictingPaths
    .map(({ path, index }) => ({ maze: createMazeFromPath(size, adjList, path), index }));

  const conflictsCount = countAllPossibleMazes(
    size,
    mazeList.map(({ maze }) => maze),
  );

  const conflictingIndicess = conflictingPaths.map(({ index }) => index);

  let totalGridCount = 0;
  for (let i = 0; i < openPaths.length; i++) {
    if (conflictingIndicess.includes(i)) {
      continue;
    }

    const usedSquareCount = squaresUsedByPath(adjList, openPaths[i]).length;
    const availableSquareCount = size * size;

    totalGridCount += 2 ** (availableSquareCount - usedSquareCount);
  }

  return totalGridCount + conflictsCount;
};

module.exports = {
  countOpenGrids,
};
