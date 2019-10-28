/* eslint-disable no-plusplus, no-continue */

//  1: \
//  0: /

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
      for (let j = 0; j < mergedTunnels.length; j++) {
        if (i === j) continue;
        const [t1Entry, t1Exit] = mergedTunnels[i];
        const [t2Entry, t2Exit] = mergedTunnels[j];
        const connection = antiTunnels.find(([atEntry, atExit]) => (
          (atEntry === t1Entry && atExit === t2Exit)
          || (atEntry === t1Exit && atExit === t2Entry)
          || (atEntry === t1Entry && atExit === t2Entry)
          || (atEntry === t1Exit && atExit === t2Exit)
        ));
        let newTunnel;
        if (connection) {
          newTunnel = [t1Entry, t1Exit, t2Entry, t2Exit]
            .filter((t) => !connection.includes(t))
            .sort((a, b) => a - b);
        }

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

const getNextRows = (possibleRows) => (state) => possibleRows
  .map((row) => {
    const [positions, tunnels, maze] = state;

    // Find "anti-tunnels", which are parts of the next row that look like "\/". These allow the
    // path to turn upwards
    const antiTunnels = [...row.matchAll(/10/g)]
      .map(({ index }) => [index, index + 1]);

    const {
      positions: tunneledPositions,
      tunnels: openTunnels,
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

    const outgoingTunnels = [...movedTunnels, ...createdTunnels]
      .sort(([p1], [p2]) => p1 - p2);

    return outgoingPositions.length
      ? [outgoingPositions, outgoingTunnels, [...maze, row]]
      : null;
  })
  .filter((result) => result);

const findAllOpenMazes = (gridSize) => {
  const possibleRows = Array.from(
    { length: 2 ** gridSize },
    (_, i) => i.toString(2).padStart(gridSize, '0'),
  );

  const getNext = getNextRows(possibleRows);

  function findMazes(level, state, mazes) {
    if (level === gridSize) {
      mazes.push(state[2]);
      return;
    }

    const nextRows = getNext(state);
    const len = nextRows.length;
    for (let i = 0; i < len; i++) {
      findMazes(level + 1, nextRows[i], mazes);
    }
  }

  const mazes = [];
  const initialPositions = Array.from({ length: gridSize }, (_, i) => i);
  findMazes(0, [initialPositions, [], []], mazes);
  return mazes;
};

module.exports = {
  findAllOpenMazes,
};
