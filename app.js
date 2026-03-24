const gridElement = document.getElementById('grid');
const size = 20; // always square grid
let grid = [];
let start = null, end = null;
let selecting = "start";

function buildGrid() {
  gridElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  gridElement.innerHTML = "";
  grid = [];

  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridElement.appendChild(cell);
      grid[r][c] = {row: r, col: c, wall: false, distance: Infinity, prev: null};

      cell.addEventListener('click', () => {
        if (selecting === "start") {
          if (start) document.querySelector(`[data-row="${start.row}"][data-col="${start.col}"]`).classList.remove('start');
          start = grid[r][c];
          cell.classList.add('start');
          selecting = "end";
        } else if (selecting === "end") {
          if (end) document.querySelector(`[data-row="${end.row}"][data-col="${end.col}"]`).classList.remove('end');
          end = grid[r][c];
          cell.classList.add('end');
          selecting = "walls";
        } else {
          if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
            grid[r][c].wall = !grid[r][c].wall;
            cell.classList.toggle('wall');
          }
        }
      });
    }
  }
}

function getNeighbors(node) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const neighbors = [];
  for (let [dr, dc] of dirs) {
    let nr = node.row + dr, nc = node.col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].wall) {
      neighbors.push(grid[nr][nc]);
    }
  }
  return neighbors;
}

async function runDijkstra() {
  if (!start || !end) {
    alert("Please select a start and end cell first!");
    return;
  }
  grid.flat().forEach(n => { n.distance = Infinity; n.prev = null; });
  start.distance = 0;
  let unvisited = [start];

  while (unvisited.length) {
    unvisited.sort((a,b) => a.distance - b.distance);
    let current = unvisited.shift();

    const cell = document.querySelector(`[data-row="${current.row}"][data-col="${current.col}"]`);
    if (!(current === start) && !(current === end)) {
      cell.classList.add('visited');
      await new Promise(res => setTimeout(res, 15));
    }

    if (current === end) {
      let pathNode = current;
      while (pathNode.prev) {
        const pathCell = document.querySelector(`[data-row="${pathNode.row}"][data-col="${pathNode.col}"]`);
        if (!pathCell.classList.contains('start') && !pathCell.classList.contains('end')) {
          pathCell.classList.add('path');
        }
        pathNode = pathNode.prev;
      }
      break;
    }

    for (let neighbor of getNeighbors(current)) {
      let alt = current.distance + 1;
      if (alt < neighbor.distance) {
        neighbor.distance = alt;
        neighbor.prev = current;
        if (!unvisited.includes(neighbor)) unvisited.push(neighbor);
      }
    }
  }
}

function resetGrid() {
  buildGrid();
  start = null;
  end = null;
  selecting = "start";
}

buildGrid();
