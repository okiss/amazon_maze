//  1: \
//  0: /

const memoize = (fn) => {
  const store = {};

  return (...args) => {
    const key = args.join('.');
    if (!store[key]) {
      store[key] = fn(...args);
    }
    return store[key];
  };
};

const countAllSimpleMazes = (gridSize) => {
  const possibleRows = Array.from(
    { length: 2 ** gridSize },
    (_, i) => i.toString(2).padStart(gridSize, '0'),
  );

  const getNextRows = memoize((...livePositions) => possibleRows
    .map((row) => {
      const nextPositions = livePositions
        .map((position) => {
          if (position !== gridSize - 1 && row.slice(position, position + 2) === '11') {
            return position + 1;
          } if (position !== 0 && row.slice(position - 1, position + 1) === '00') {
            return position - 1;
          }
          return -1;
        })
        .filter((position) => position >= 0);
      return { row, nextPositions };
    })
    .filter(({ nextPositions }) => nextPositions.length));

  const countMazes = (level, livePositions) => {
    if (level === gridSize) {
      return 1;
    }

    let count = 0;
    getNextRows(...livePositions).forEach((row) => {
      count += countMazes(level + 1, row.nextPositions);
    });

    return count;
  };

  const initialLivePositions = Array.from({ length: gridSize }, (_, i) => i);
  return countMazes(0, initialLivePositions);
};

module.exports = {
  countAllSimpleMazes,
};
