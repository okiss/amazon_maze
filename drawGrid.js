/* eslint-disable no-console,no-plusplus */

const SIZE = 32;
const PER_ROW = 4;

const drawLine = (startPoint, endPoint, color = 'black') => `
  <line
    x1="${startPoint.x}"
    y1="${startPoint.y}"
    x2="${endPoint.x}"
    y2="${endPoint.y}"
    stroke="${color}"
  />
`;

const drawCircle = (position, radius, color = 'black') => `
  <circle
    cx="${position.x}"
    cy="${position.y}"
    r="${radius}"
    stroke="${color}"
    fill="none"
  />
`;

const getVertexPosition = ([type, i, j]) => (
  type === 'v'
    ? {
      x: SIZE * (Number(j) + 1),
      y: (Number(i) * SIZE) + (SIZE / 2),
    }
    : {
      x: (Number(j) * SIZE) + (SIZE / 2),
      y: SIZE * Number(i),
    }
);

const drawGrid = (gridSize, vertexList, path, usedSquares) => {
  const drawGridLines = () => {
    const lines = [];
    for (let i = 0; i < gridSize + 1; i++) {
      lines.push(drawLine(
        { x: 0, y: i * SIZE },
        { x: gridSize * SIZE, y: i * SIZE },
      ));
      lines.push(drawLine(
        { x: i * SIZE, y: 0 },
        { x: i * SIZE, y: gridSize * SIZE },
      ));
    }
    return lines.join('');
  };

  const drawVertices = () => Object
    .keys(vertexList)
    .map((v) => drawCircle(getVertexPosition(v), SIZE / 32, 'purple'))
    .join('');

  const drawPath = () => {
    const lines = [];
    for (let i = 0; i < path.length - 1; i++) {
      const startVertex = path[i];
      const endVertex = path[i + 1];
      lines.push(drawLine(
        getVertexPosition(startVertex),
        getVertexPosition(endVertex),
        'red',
      ));
    }
    return lines.join('');
  };

  const drawUsedSquares = () => usedSquares
    .map((square) => {
      const [i, j] = square.square;
      const color = square.wall === '1' ? 'green' : 'blue';
      const x = (Number(j) * SIZE) + (SIZE / 2);
      const y = (Number(i) * SIZE) + (SIZE / 2);
      return drawCircle({ x, y }, SIZE / 4, color);
    })
    .join('');

  return `
    ${drawGridLines()}
    ${drawVertices()}
    ${drawPath()}
    ${drawUsedSquares()}
  `;
};

const drawGrids = (gridSize, vertexList, pathList, usedSquaresList) => {
  const grids = [];
  for (let i = 0; i < pathList.length; i++) {
    const grid = drawGrid(gridSize, vertexList, pathList[i], usedSquaresList[i]);
    const xOffset = (i % PER_ROW) * (gridSize * SIZE + SIZE);
    const yOffset = Math.floor(i / PER_ROW) * (gridSize * SIZE + SIZE);
    grids.push(
      `<g transform="translate(${xOffset} ${yOffset})">${grid}</g>`,
    );
  }
  return grids.join('');
};

const drawSVG = (contents) => `<?xml version="1.0" encoding="UTF-8" ?>
  <svg xmlns="http://www.w3.org/2000/svg">
    ${contents}
  </svg>
`;

module.exports = {
  drawGrid,
  drawGrids,
  drawSVG,
};
