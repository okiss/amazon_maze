/* eslint-disable no-plusplus */

//  1: \
//  0: /

const memoize = (fn) => {
  const store = {};

  return (...args) => {
    const key = args.join(':');
    if (!store[key]) {
      store[key] = fn(...args);
    }
    return store[key];
  };
};

const movePosition = (position, row) => {
  if (position !== row.length - 1 && row.slice(position, position + 2) === '11') {
    return position + 1;
  } if (position !== 0 && row.slice(position - 1, position + 1) === '00') {
    return position - 1;
  }
  return -1;
};

const applyTunnels = (positions, tunnels, antiTunnels) => {
  // Merge tunnels which are connected with an anti-tunnel
  let mergedTunnels = tunnels;
  let didMerge = true;
  while (didMerge) {
    didMerge = false;
    for (let i = 0; i < mergedTunnels.length - 1; i++) {
      for (let j = i + i; j < mergedTunnels.length; j++) {
        const [t1Entry, t1Exit] = mergedTunnels[i].sort((a, b) => a - b);
        const [t2Entry, t2Exit] = mergedTunnels[j].sort((a, b) => a - b);
        const areConnected = antiTunnels
          .find(([atEntry, atExit]) => atEntry === t1Exit && atExit === t2Entry);

        if (t1Exit + 1 === t2Entry && areConnected) {
          mergedTunnels = [
            ...mergedTunnels.slice(0, i),
            [t1Entry, t2Exit],
            ...mergedTunnels.slice(i + 2),
          ];
          didMerge = true;
          break;
        }
      }
      if (didMerge) break;
    }
  }

  // If a positon, an anti-tunnel, and a tunnel meet, move the position to the other side of the
  // tunnel and close the tunnel
  let openTunnels = mergedTunnels;
  let movedPositions = positions;
  for (let i = 0; i < antiTunnels.length; i++) {
    const [at1, at2] = antiTunnels[i];
    const leftTunnel = openTunnels.find(([, t]) => t === at1);
    const rightTunnel = openTunnels.find(([t]) => t === at2);

    let movedPosition;
    let positionToRemove;
    let tunnelToRemove;
    if (movedPositions.includes(at1) && rightTunnel) {
      [, movedPosition] = rightTunnel;
      positionToRemove = movedPositions.indexOf(at1);
      tunnelToRemove = openTunnels.indexOf(rightTunnel);
    } else if (movedPositions.includes(at2) && leftTunnel) {
      [movedPosition] = leftTunnel;
      positionToRemove = movedPositions.indexOf(at2);
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


const countAllOpenMazes = (gridSize) => {
  const possibleRows = Array.from(
    { length: 2 ** gridSize },
    (_, i) => i.toString(2).padStart(gridSize, '0'),
  );

  const getNextRows = memoize((positions, tunnels) => possibleRows
    .map((row) => {
      // Find "anti-tunnels", which are parts of the next row that look like "\/". These allow the
      // path to turn upwards
      const antiTunnels = [...row.matchAll(/10/g)]
        .map(({ index }) => [index, index + 1]);

      const {
        positions: tunneledPositions,
        tunnels: openTunnels
      } = applyTunnels(positions, tunnels, antiTunnels);

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

      const outcomingTunnels = [...movedTunnels, ...createdTunnels]
        .sort(([p1], [p2]) => p1 - p2);


      return { positions: outgoingPositions, tunnels: outcomingTunnels };
    })
    .filter((row) => row.positions.length));

  const countMazes = (level, positions, tunnels) => {
    if (level === gridSize) {
      return 1;
    }

    let count = 0;
    const nextRows = getNextRows(positions, tunnels);
    for (let i = 0; i < nextRows.length; i++) {
      const row = nextRows[i];
      count += countMazes(level + 1, row.positions, row.tunnels);
    }

    return count;
  };

  const initialPositions = Array.from({ length: gridSize }, (_, i) => i);
  return countMazes(0, initialPositions, []);
};

module.exports = {
  countAllOpenMazes,
};
