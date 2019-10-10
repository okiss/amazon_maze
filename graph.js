const h = (i, j) => `h${i}${j}`;
const v = (i, j) => `v${i}${j}`;

const visualizeGraph = (adjList) => {
  console.log('digraph G {')
  Object.keys(adjList).forEach((v1) => {
    Object.keys(adjList[v1]).forEach((v2) => {
      console.log(`  "${v1}" -> "${v2}"`);
    })
  })
  console.log('}')
}

const constructGraph = (size) => {
  const adjList = {};
  const vertexList = {};

  const setEdge = (v1, v2, data = {}, bidirectional = true) => {
    if (!adjList[v1]) {
      adjList[v1] = {};
    }

    adjList[v1][v2] = data;

    if (bidirectional) {
      setEdge(v2, v1, data, false)
    }
  }

  const setVertex = (name, data = {}) => {
    vertexList[name] = data;
  }

  for (let i = 0; i < size + 1; i++) {
    for (let j = 0; j < size; j++) {
      setVertex(
        h(i, j),
        { start: i === 0, end: i === size }
      );
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - 1; j++) {
      setVertex(v(i, j));
    }
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - 1; j++) {
      setEdge(h(i, j), v(i, j), { square: `${i}${j}`, wall: '0' });
      setEdge(h(i + 1, j), v(i, j), { square: `${i}${j}`, wall: '1' });
      setEdge(h(i, j + 1), v(i, j), { square: `${i}${j + 1}`, wall: '1' });
      setEdge(h(i + 1, j + 1), v(i, j), { square: `${i}${j + 1}`, wall: '0' });
    }
  }

  return {
    size,
    adjList,
    vertexList
  }
}

function* findPaths(adjList, partialPath, endVertices) {
  const currentVertex = partialPath[partialPath.length - 1];

  if (endVertices.includes(currentVertex)) {
    yield partialPath;
    return;
  }

  const previousVertex = partialPath[partialPath.length - 2];

  const edges = adjList[currentVertex];
  const neighbors = Object.keys(edges);

  for (let i = 0; i < neighbors.length; i++) {
    const nextVertex = neighbors[i];

    const shouldExplore =
      nextVertex !== currentVertex &&
      (!previousVertex || edges[previousVertex].square !== edges[nextVertex].square) &&
      !partialPath.includes(nextVertex);
    
    if (!shouldExplore) continue;

    yield* findPaths(adjList, [...partialPath, nextVertex], endVertices);
  }
}

function* findAllOpenPaths(adjList, vertexList) {
  const startVertices = Object.keys(vertexList).filter(v => vertexList[v].start);
  const endVertices = Object.keys(vertexList).filter(v => vertexList[v].end);

  for (let i = 0; i < startVertices.length; i++) {
    yield* findPaths(adjList, [startVertices[i]], endVertices);
  }
}

module.exports = {
  visualizeGraph,
  constructGraph,
  findAllOpenPaths
};
