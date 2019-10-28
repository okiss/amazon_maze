/* eslint-disable no-plusplus, no-restricted-syntax, no-console */

//  1: \
//  0: /

const memoize = (fn) => {
  const store = {};

  return (key) => {
    if (!store[key]) {
      store[key] = fn(key);
    }
    return store[key];
  };
};

const serializeState = (labels) => JSON.stringify(labels);

const deserializeState = (state) => JSON.parse(state);

const trackLabel = (index, labels, row) => {
  const label = labels[index];
  const labelIndices = labels
    .map((l, i) => (l === label ? i : -1))
    .filter((i) => i !== -1);

  if (labelIndices.length === 1) {
    return label;
  }
  if (labelIndices.length !== 2) {
    throw new Error(
      `Each label should only occur one or two times. index: ${index} labels: ${labels}`,
    );
  }

  const [l1, l2] = labelIndices;
  const otherEnd = index === l1 ? l2 : l1;

  if (otherEnd !== 0 && row.slice(otherEnd - 1, otherEnd + 1) === '10') {
    return trackLabel(otherEnd - 1, labels, row);
  } if (otherEnd !== row.length && row.slice(otherEnd, otherEnd + 2) === '10') {
    return trackLabel(otherEnd + 1, labels, row);
  }
  return label;
};

const normalizeLabels = (labels) => {
  const size = labels.length;
  const seenLower = { map: {}, counter: 1 };
  const seenHigher = { map: {}, counter: size + 1 };
  return labels.map((l) => {
    const seen = l <= size ? seenLower : seenHigher;
    if (!seen.map[l]) {
      seen.map[l] = seen.counter;
      seen.counter += 1;
    }
    return seen.map[l];
  });
};

const getNextRows = (possibleRows) => memoize((state) => possibleRows
  .map((row) => {
    const size = row.length;
    const labels = deserializeState(state);
    const newLabels = new Array(size);
    let maxLabel = Math.max(size, ...labels);
    let canPass = false;

    for (let i = 0; i < size; i++) {
      if (i !== 0 && row.slice(i - 1, i + 1) === '11') {
        const trackedLabel = trackLabel(i - 1, labels, row);
        newLabels[i] = trackedLabel;
        canPass = canPass || trackedLabel <= size;
      } else if (i !== size && row.slice(i, i + 2) === '00') {
        const trackedLabel = trackLabel(i + 1, labels, row);
        newLabels[i] = trackedLabel;
        canPass = canPass || trackedLabel <= size;
      } else if (i !== 0 && row.slice(i - 1, i + 1) === '01') {
        newLabels[i] = newLabels[i - 1];
      } else {
        maxLabel += 1;
        newLabels[i] = maxLabel;
      }
    }
    const normalizedLabels = normalizeLabels(newLabels);
    return canPass && serializeState(normalizedLabels);
  })
  .filter((result) => result));

const countAllOpenMazes = (gridSize) => {
  const possibleRows = Array.from(
    { length: 2 ** gridSize },
    (_, i) => i.toString(2).padStart(gridSize, '0'),
  );

  const getNext = getNextRows(possibleRows);

  function countMazes(level, state) {
    if (level === gridSize) {
      return 1;
    }

    let count = 0;
    const nextRows = getNext(state);
    const len = nextRows.length;
    for (let i = 0; i < len; i++) {
      count += countMazes(level + 1, nextRows[i]);
    }

    return count;
  }

  const initialLabels = Array.from({ length: gridSize }, (_, i) => i + 1);
  return countMazes(0, serializeState(initialLabels));
};

const exampleMaze = () => {
  const maze = [
    '0010',
    '1101',
    '0100',
    '0011',
  ];

  let state = serializeState([1, 2, 3, 4]);
  maze.forEach((row) => {
    [state] = getNextRows([row])(state);
    console.log(state);
  });
};

module.exports = {
  countAllOpenMazes,
  exampleMaze,
};
