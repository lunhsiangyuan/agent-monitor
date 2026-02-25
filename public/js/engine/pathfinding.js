const Pathfinding = (() => {
  // BFS on a 2D boolean grid. true = walkable.
  // Returns array of {col, row} from start (exclusive) to end (inclusive).
  // Returns [] if start === end or no path found.
  function findPath(grid, startCol, startRow, endCol, endRow) {
    if (startCol === endCol && startRow === endRow) return [];
    const rows = grid.length;
    const cols = grid[0].length;
    if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) return [];
    if (!grid[endRow][endCol]) return []; // destination not walkable
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ col: startCol, row: startRow, path: [] }];
    visited[startRow][startCol] = true;
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // up, down, left, right

    while (queue.length > 0) {
      const { col, row, path } = queue.shift();
      for (const [dc, dr] of dirs) {
        const nc = col + dc;
        const nr = row + dr;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        if (visited[nr][nc] || !grid[nr][nc]) continue;
        const newPath = [...path, { col: nc, row: nr }];
        if (nc === endCol && nr === endRow) return newPath;
        visited[nr][nc] = true;
        queue.push({ col: nc, row: nr, path: newPath });
      }
    }
    return []; // no path found
  }

  return { findPath };
})();
