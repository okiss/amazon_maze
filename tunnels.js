/* eslint-disable no-plusplus, no-continue */

const memoize = (fn) => {
  const store = {};

  return (key) => {
    if (!store[key]) {
      store[key] = fn(key);
    }
    return store[key];
  };
};

const serializeState = (positions, tunnels) => JSON.stringify({ positions, tunnels });

const deserializeState = (state) => JSON.parse(state);

const movePosition = (position, row) => {
  if (position !== row.length - 1 && row.slice(position, position + 2) === '11') {
    return position + 1;
  } if (position !== 0 && row.slice(position - 1, position + 1) === '00') {
    return position - 1;
  }
  return -1;
};

const applyTunnels = (positions, tunnels, connections) => {
  // Merge tunnels which are connected with a connection ("\/" pattern on the grid)
  let mergedTunnels = tunnels;
  let didMerge = true;
  while (didMerge) {
    didMerge = false;
    for (let i = 0; i < mergedTunnels.length - 1; i++) {
      for (let j = 0; j < mergedTunnels.length; j++) {
        if (i === j) continue;
        const [t1Entry, t1Exit] = mergedTunnels[i];
        const [t2Entry, t2Exit] = mergedTunnels[j];
        const newTunnel = connections
          .map((at) => (
            [t1Entry, t1Exit, t2Entry, t2Exit]
              .filter((t) => !at.includes(t))
              .sort((a, b) => a - b)
          ))
          .find((tunnel) => (
            tunnel.length === 2
            && !(
              (t1Entry === tunnel[0] && t1Exit === tunnel[1])
              || (t2Entry === tunnel[0] && t2Exit === tunnel[1])
            )
          ));

        if (newTunnel) {
          mergedTunnels = mergedTunnels
            .filter((_, index) => index !== i && index !== j)
            .concat([newTunnel])
            .sort(([entry1], [entry2]) => entry1 - entry2);
          didMerge = true;
          break;
        }
      }
      if (didMerge) break;
    }
  }

  // If a positon, a connection, and a tunnel meet, move the position to the other side of the
  // tunnel and close the tunnel
  let openTunnels = mergedTunnels;
  let movedPositions = positions;
  for (let i = 0; i < connections.length; i++) {
    const [c1, c2] = connections[i];
    const leftTunnel = openTunnels.find(([, t]) => t === c1);
    const rightTunnel = openTunnels.find(([t]) => t === c2);

    let movedPosition;
    let positionToRemove;
    let tunnelToRemove;
    if (movedPositions.includes(c1) && rightTunnel) {
      [, movedPosition] = rightTunnel;
      positionToRemove = movedPositions.indexOf(c1);
      tunnelToRemove = openTunnels.indexOf(rightTunnel);
    } else if (movedPositions.includes(c2) && leftTunnel) {
      [movedPosition] = leftTunnel;
      positionToRemove = movedPositions.indexOf(c2);
      tunnelToRemove = openTunnels.indexOf(leftTunnel);
    }
    if (movedPosition !== undefined) {
      movedPositions = [
        ...movedPositions.slice(0, positionToRemove),
        ...movedPositions.slice(positionToRemove + 1),
        movedPosition,
      ].sort((a, b) => a - b);
      openTunnels = [
        ...openTunnels.slice(0, tunnelToRemove),
        ...openTunnels.slice(tunnelToRemove + 1),
      ];
    }
  }

  return { positions: movedPositions, tunnels: openTunnels };
};

const getNextRows = (possibleRows) => memoize((state) => possibleRows
  .map((row) => {
    const { positions, tunnels } = deserializeState(state);

    // Find connections, which are parts of the next row that look like "\/". These allow the
    // path to turn upwards
    const connections = [...row.matchAll(/10/g)]
      .map(({ index }) => [index, index + 1]);

    const {
      positions: tunneledPositions,
      tunnels: openTunnels,
    } = applyTunnels(positions, tunnels, connections);

    // After the positions were passed through the tunnels, they are passed down through the row.
    // Positions and tunnel openings will move to new places or they will be removed. New tunnels
    // may be created if the row contains a "/\" pattern
    const outgoingPositions = tunneledPositions
      .map((position) => movePosition(position, row))
      .filter((position) => position >= 0);

    const movedTunnels = openTunnels
      .map(([p1, p2]) => ([movePosition(p1, row), movePosition(p2, row)]))
      .filter(([p1, p2]) => p1 !== -1 && p2 !== -1);
    const createdTunnels = [...row.matchAll(/01/g)]
      .map(({ index }) => [index, index + 1]);

    const outgoingTunnels = [...movedTunnels, ...createdTunnels]
      .sort(([p1], [p2]) => p1 - p2);

    return outgoingPositions.length
      ? serializeState(outgoingPositions, outgoingTunnels)
      : null;
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

  const initialPositions = Array.from({ length: gridSize }, (_, i) => i);
  return countMazes(0, serializeState(initialPositions, []));
};

const exampleMaze = () => {
  const maze = [
    '11010',
    '00011',
    '11110',
    '00000',
    '10000',
  ];
  const initialPositions = Array.from({ length: maze.length }, (_, i) => i);
  let state = serializeState(initialPositions, []);
  maze.forEach((row) => {
    [state] = getNextRows([row])(state);
    console.log(state);
  });
};

module.exports = {
  countAllOpenMazes,
  exampleMaze,
};
