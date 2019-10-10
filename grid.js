const { drawGrids, drawSVG } = require('./drawGrid');

const isFree = symbol => symbol === 'x';

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
  }
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
    { maze: newMaze + wildcard, free: newFree }
  );
  generateMazesFromWildcards(
    size,
    addMaze,
    { maze: newMaze, free: newFree }
  );
}

const countAllPossibleMazes = (size, mazeList) => {
  const mazeStorage = {};
  const shift = Math.floor(size * size / 2);

  const addMaze = (maze) => {
    // const slices = [];
    // for (let i = 0; i < size; i++) {
    //   const shift = (size - i - 1) * size;
    //   slices.push(Math.floor(maze / 2 ** shift));
    //   maze = maze % (2 ** shift);
    // }
    //
    // let partialPath = mazeStorage;
    // for (let i = 0; i < size; i++) {
    //   if (!partialPath[slices[i]]) {
    //     partialPath[slices[i]] = {};
    //   }
    //   partialPath = partialPath[slices[i]];
    // }

    const head = Math.floor(maze / (2 ** shift));
    const tail = maze % (2 ** shift);
    if (!mazeStorage[head]) {
      mazeStorage[head] = {};
    }
    mazeStorage[head][tail] = true;
  }

  const countLeaves = (tree) => {
    const nodes = Object.keys(tree);
    if (nodes.length === 0) {
      return 1;
    }
    return nodes.reduce((count, node) => count + countLeaves(tree[node]), 0);
  }

  for (let i = 0; i < mazeList.length; i++) {
    generateMazesFromWildcards(size, addMaze, mazeList[i]);
  }

  return countLeaves(mazeStorage);
}

const checkIfCorrect = (size, adjList, openPaths, expectedResult) => {
  const mazeList = openPaths.map(path => createMazeFromPath(size, adjList, path));
  const totalCount = countAllPossibleMazes(mazeList);
  console.log(`
    counting all mazes: ${totalCount}
    counting free squares: ${expectedResult}
    diff: ${totalCount - expectedResult}
    open paths: ${openPaths.length}
  `);
  return totalCount === expectedResult;
}

const squaresUsedByPath = (adjList, path) => {
  const usedSquares = [];
  for (let i = 0; i < path.length - 1; i++) {
    const v1 = path[i];
    const v2 = path[i + 1];

    const square = adjList[v1][v2].square;
    if (!usedSquares.includes(square)) {
      usedSquares.push(square);
    }
  }
  return usedSquares;
}

const checkMazeOverlap = (m1, m2) => {
  for (let i = 0; i < m1.length; i++) {
    const first = m1[i];
    const second = m2[i];

    if (!isFree(first) && !isFree(second) && first !== second) {
      return false;
    }
  }
  return true;
}

const mergeMazes = (m1, m2) => {
  const maze = Array.from({ length: m1.length }).fill('x');
  for (let i = 0; i < maze.length; i++) {
    maze[i] = [m1[i], m2[i]].find(symbol => !isFree(symbol)) || 'x';
  }
  return maze.join('');
}

const createPathSymmetryMask = (size, adjList, path) => {
  const distanceFromCenter = x => Math.floor(Math.abs((size + 1) / 2 - (x + 1)));

  const squares = squaresUsedByPath(adjList, path);
  return {
    x: Number(squares.map(([_, j]) => distanceFromCenter(j)).join('')),
    y: Number(squares.map(([i]) => distanceFromCenter(i)).join(''))
  };
};

const removeSymmetricPaths = (size, adjList, openPaths) =>
  openPaths
    .map(path => ({
      mask: createPathSymmetryMask(size, adjList, path),
      path
    }))
    .sort((a, b) => a.mask.x- b.mask.x || a.mask.y - b.mask.y)
    .filter((_, i) => i % 4 === 0)
    .map(({ path }) => path);

const findConflictingMazes = (mazeList, hasValue, value) => {
  const size = mazeList.length;
  const conflicts = new Set();
  for (let i = 0; i < size; i++) {
    const hasValueI = hasValue[i];
    const valueI = value[i];
    const m1index = mazeList[i].index;
    for (let j = i + 1; j < size; j++) {
      const bothValues = hasValueI & hasValue[j];
      const m1 = bothValues & valueI;
      const m2 = bothValues & value[j];
      if (m1 === m2) {
        const m2Index = mazeList[j].index;
        conflicts.add(m1index);
        conflicts.add(m2Index);
      }
    }
  }
  return conflicts;
}

const countOpenGrids = (size, adjList, openPaths, vertexList) => {
  // console.log('open path count: ', openPaths.length);

  // const conflictingPaths =
  //   openPaths
  //     .map((path, index) => ({ path, index }))
  //     .filter(({ path }) => {
  //       const squares = squaresUsedByPath(adjList, path);
  //       for (let i = 0; i < size; i++) {
  //         let type;
  //         for (let j = 0; j < size; j++) {
  //           let s = squares.find(({ square }) => square === `${i}${j}`);
  //           if (!s) {
  //             continue;
  //           }
  //           if (!type) {
  //             type = s.wall;
  //           }
  //           if (type !== s.wall) {
  //             return false;
  //           }
  //         }
  //       }
  //       const minColumn = squares.reduce((min, [_, j]) => Math.min(min, j), size - 1);
  //       const maxColumn = squares.reduce((max, [_, j]) => Math.max(max, j), 0);
  //       return minColumn !== 0 || maxColumn !== size - 1;
  //     });
  //
  // const conflictingIndicess = conflictingPaths.map(({ index }) => index);
  //
  // const somePaths = conflictingPaths.slice(0, 15).map(({ path }) => path);
  // const someSquares = somePaths.map(path => squaresUsedByPath(adjList, path));
  // const grids = drawGrids(6, vertexList, somePaths, someSquares);
  // console.log(drawSVG(grids));

  // const mazeList =
  //   conflictingPaths
  //     .map(({ path, index }) => ({ maze: createMazeFromPath(size, adjList, path), index }));
  //
  // const hasValueMask = mazeList.map(({ maze }) =>
  //   BigInt('0b' + maze.replace(/0/g, '1').replace(/x/g, '0'))
  // );
  // const valueBitFields = mazeList.map(({ maze }) =>
  //   BigInt('0b' + maze.replace(/x/g, '0'))
  // );
  //
  // const conflicts = findConflictingMazes(mazeList, hasValueMask, valueBitFields);

  // console.log('conflicts', conflicts.size);

  // const conflictsCount = countAllPossibleMazes(
  //   size, mazeList.map(({ maze }) => maze)
  // );
  //
  let totalGridCount = 0;
  for (let i = 0; i < openPaths.length; i++) {
    // if (conflictingIndicess.includes(i)) {
    //   continue;
    // }

    const usedSquareCount = squaresUsedByPath(adjList, openPaths[i]).length;
    const availableSquareCount = size * size;

    totalGridCount += 2 ** (availableSquareCount - usedSquareCount);
  }

  // console.log(totalGridCount, conflictsCount);

  return totalGridCount;
}

module.exports = {
  countOpenGrids,
  checkIfCorrect
};
