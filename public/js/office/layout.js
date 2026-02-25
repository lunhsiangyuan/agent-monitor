// ── 辦公室自動佈局引擎 ──
// 根據團隊成員數量自動生成辦公室配置
// 產出 grid（可行走地圖）、桌椅位置、裝飾物件等
const OfficeLayout = (() => {
  // 目前的 grid 供 Pathfinding 使用
  let _currentGrid = null;

  // 家具尺寸（以 tile 為單位）
  const DESK_W = 2, DESK_H = 2;      // 桌子 32×32 = 2×2 tiles
  const BOOKSHELF_W = 1, BOOKSHELF_H = 2; // 書架 16×32 = 1×2 tiles
  const WINDOW_W = 2, WINDOW_H = 2;   // 窗戶 32×32 = 2×2 tiles
  const WHITEBOARD_W = 2, WHITEBOARD_H = 1; // 白板 32×16 = 2×1 tiles
  const WALL_ROWS = 2; // 牆壁佔前 2 行

  /**
   * 根據成員數計算辦公室尺寸
   * @param {number} count - 成員數（2~8）
   * @returns {{ cols: number, rows: number }}
   */
  function calcSize(count) {
    // 基礎寬度依成員數縮放，確保桌子排得下且有走道
    // 每張桌子佔 2 tiles 寬，桌間需 1 tile 走道
    const desksPerRow = count <= 3 ? count : Math.ceil(count / 2);
    // 最小寬度：左牆1 + (桌2+走道1)*桌數 + 右牆1，再加些邊距
    const minWidth = 2 + desksPerRow * 3 + 2;
    const cols = Math.max(14, minWidth);

    // 行數：牆2 + 上排桌區4 + 走道2 + （可能下排桌區4 + 走道2）+ 咖啡區3 + 底邊1
    if (count <= 3) {
      // 單排：牆2 + 椅1 + 桌2 + 走道3 + 咖啡區3 + 底邊1 = 12
      return { cols, rows: 13 };
    }
    // 雙排：牆2 + 椅1 + 桌2 + 走道3 + 桌2 + 椅1 + 走道2 + 咖啡區2 + 底邊1 = 16
    return { cols, rows: 16 };
  }

  /**
   * 建立初始 grid（全部可行走）
   */
  function createGrid(cols, rows) {
    return Array.from({ length: rows }, () => Array(cols).fill(true));
  }

  /**
   * 將指定區域標記為不可行走
   */
  function blockArea(grid, col, row, w, h) {
    for (let r = row; r < row + h && r < grid.length; r++) {
      for (let c = col; c < col + w && c < grid[0].length; c++) {
        if (r >= 0 && c >= 0) grid[r][c] = false;
      }
    }
  }

  /**
   * 計算桌子排列位置
   * @param {number} count - 成員數
   * @param {number} cols - 總欄數
   * @returns {Array} 桌子物件陣列
   */
  function arrangeDesks(count, cols) {
    const desks = [];

    if (count <= 3) {
      // === 單排桌子（面朝下，椅子在桌子下方）===
      const deskRow = WALL_ROWS; // 桌子緊靠牆壁下方（row 2-3）
      const totalDeskWidth = count * DESK_W + (count - 1) * 1; // 桌間走道 1 tile
      const startCol = Math.floor((cols - totalDeskWidth) / 2);

      for (let i = 0; i < count; i++) {
        const col = startCol + i * (DESK_W + 1);
        desks.push({
          col, row: deskRow,
          chairCol: col, chairRow: deskRow + DESK_H, // 椅子在桌子正下方
          pcCol: col + 1, pcRow: deskRow,             // PC 在桌面右上角
          chairDirection: 'up',                        // 椅子面朝上（朝桌子）
        });
      }
    } else {
      // === 雙排桌子（面對面）===
      const topCount = Math.ceil(count / 2);
      const bottomCount = count - topCount;

      // 上排：桌子在 row 2-3，椅子在 row 4（面朝上，朝桌子方向）
      const topDeskRow = WALL_ROWS;
      const topTotalW = topCount * DESK_W + (topCount - 1) * 1;
      const topStartCol = Math.floor((cols - topTotalW) / 2);

      for (let i = 0; i < topCount; i++) {
        const col = topStartCol + i * (DESK_W + 1);
        desks.push({
          col, row: topDeskRow,
          chairCol: col, chairRow: topDeskRow + DESK_H,
          pcCol: col + 1, pcRow: topDeskRow,
          chairDirection: 'up',
        });
      }

      // 下排：桌子在 row 7-8，椅子在 row 6（面朝下，朝桌子方向）
      const bottomDeskRow = topDeskRow + DESK_H + 3; // 留 3 行走道
      const bottomTotalW = bottomCount * DESK_W + (bottomCount - 1) * 1;
      const bottomStartCol = Math.floor((cols - bottomTotalW) / 2);

      for (let i = 0; i < bottomCount; i++) {
        const col = bottomStartCol + i * (DESK_W + 1);
        desks.push({
          col, row: bottomDeskRow,
          chairCol: col, chairRow: bottomDeskRow - 1,
          pcCol: col + 1, pcRow: bottomDeskRow + 1,
          chairDirection: 'down',
        });
      }
    }

    return desks;
  }

  /**
   * 放置牆面裝飾（白板、窗戶、時鐘）
   * 裝飾物固定在牆壁區域（row 0-1）
   */
  function placeWallDecorations(cols) {
    const decorations = [];
    // 白板放在牆面左側區域
    const wbCol = 2;
    decorations.push({ type: 'whiteboard', col: wbCol, row: 0 });

    // 窗戶放在牆面中央偏右
    const winCol = Math.min(cols - 4, Math.floor(cols / 2));
    decorations.push({ type: 'window', col: winCol, row: 0 });

    // 時鐘放在白板和窗戶之間
    const clockCol = Math.floor((wbCol + WHITEBOARD_W + winCol) / 2);
    if (clockCol > wbCol + WHITEBOARD_W && clockCol < winCol) {
      decorations.push({ type: 'clock', col: clockCol, row: 0 });
    } else {
      // 放在窗戶右邊
      decorations.push({ type: 'clock', col: Math.min(winCol + WINDOW_W + 1, cols - 2), row: 0 });
    }

    return decorations;
  }

  /**
   * 放置地面裝飾（書架、盆栽）
   * 書架靠牆放置，盆栽散佈在角落
   */
  function placeFloorDecorations(cols, rows, grid) {
    const decorations = [];

    // 書架放在左上角（col 1 靠牆內側，row 2-3）
    const bsCol = 1;
    const bsRow = WALL_ROWS;
    decorations.push({ type: 'bookshelf', col: bsCol, row: bsRow });
    blockArea(grid, bsCol, bsRow, BOOKSHELF_W, BOOKSHELF_H);

    // 盆栽放在右上角（牆內側）
    const plantTopCol = cols - 2;
    const plantTopRow = WALL_ROWS;
    decorations.push({ type: 'plant', col: plantTopCol, row: plantTopRow });
    blockArea(grid, plantTopCol, plantTopRow, 1, 2);

    // 盆栽放在左下角（牆內側）
    const plantBLCol = 1;
    const plantBLRow = rows - 3;
    decorations.push({ type: 'plant', col: plantBLCol, row: plantBLRow });
    blockArea(grid, plantBLCol, plantBLRow, 1, 2);

    // 盆栽放在右下角（牆內側）
    const plantBRCol = cols - 2;
    const plantBRRow = rows - 3;
    decorations.push({ type: 'plant', col: plantBRCol, row: plantBRRow });
    blockArea(grid, plantBRCol, plantBRRow, 1, 2);

    return decorations;
  }

  /**
   * 放置咖啡機（底部中央區域，靠牆擺放）
   */
  function placeCoffeeMachine(cols, rows, grid) {
    const col = Math.floor(cols / 2);
    const row = rows - 3; // 底部區域（留出底牆空間）
    blockArea(grid, col, row, 1, 2); // 咖啡機佔 1×2 tiles（高度）
    return { type: 'coffee_machine', col, row };
  }

  /**
   * 驗證所有桌椅到咖啡機之間是否有可行走路徑
   * 若無路徑則嘗試修復（開闢走道）
   */
  function validatePaths(grid, desks, coffeeMachine) {
    const cmCol = coffeeMachine.col;
    // 咖啡機前方（上方一格）作為目的地
    const cmTargetRow = coffeeMachine.row - 1;
    const cmTargetCol = cmCol;

    for (const desk of desks) {
      // 從椅子位置到咖啡機前方尋路
      const path = Pathfinding.findPath(
        grid, desk.chairCol, desk.chairRow, cmTargetCol, cmTargetRow
      );
      if (path.length === 0 && !(desk.chairCol === cmTargetCol && desk.chairRow === cmTargetRow)) {
        // 路徑不通，嘗試簡單修復：確保椅子周圍至少有一格可走
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dc, dr] of dirs) {
          const nc = desk.chairCol + dc;
          const nr = desk.chairRow + dr;
          if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
            grid[nr][nc] = true;
          }
        }
      }
    }
  }

  /**
   * 主要生成函數
   * @param {number} memberCount - 團隊成員數（2~8）
   * @returns {Object} 辦公室佈局配置
   */
  function generate(memberCount) {
    const count = Math.max(2, Math.min(8, memberCount));
    const { cols, rows } = calcSize(count);
    const grid = createGrid(cols, rows);

    // 1. 牆壁區域不可行走（row 0-1）
    blockArea(grid, 0, 0, cols, WALL_ROWS);

    // 2. 最底部一行也不可行走（底牆）
    blockArea(grid, 0, rows - 1, cols, 1);

    // 3. 左右牆壁不可行走
    for (let r = 0; r < rows; r++) {
      grid[r][0] = false;
      grid[r][cols - 1] = false;
    }

    // 4. 排列桌子
    const desks = arrangeDesks(count, cols);
    for (const d of desks) {
      blockArea(grid, d.col, d.row, DESK_W, DESK_H);
    }
    // 注意：椅子位置保持可行走（角色坐在那裡）

    // 5. 牆面裝飾（在牆壁區域內，已被 blockArea 設為不可行走）
    const wallDecos = placeWallDecorations(cols);

    // 6. 地面裝飾（書架、盆栽，會佔地面空間）
    const floorDecos = placeFloorDecorations(cols, rows, grid);

    // 7. 咖啡機
    const coffeeMachine = placeCoffeeMachine(cols, rows, grid);

    // 8. 確保椅子位置可行走
    for (const d of desks) {
      if (d.chairRow >= 0 && d.chairRow < rows && d.chairCol >= 0 && d.chairCol < cols) {
        grid[d.chairRow][d.chairCol] = true;
      }
    }

    // 9. 確保咖啡機前方可行走（角色需要走到這裡取咖啡）
    const cmApproachRow = coffeeMachine.row - 1;
    if (cmApproachRow >= 0 && cmApproachRow < rows) {
      grid[cmApproachRow][coffeeMachine.col] = true;
    }

    // 10. 合併所有裝飾物
    const decorations = [...wallDecos, ...floorDecos];
    decorations.push(coffeeMachine);

    // 11. 驗證路徑連通性（需 Pathfinding 可用）
    if (typeof Pathfinding !== 'undefined') {
      validatePaths(grid, desks, coffeeMachine);
    }

    // 存儲目前 grid
    _currentGrid = grid;

    return {
      cols,
      rows,
      grid,
      desks,
      decorations,
      coffeeMachine: { col: coffeeMachine.col, row: coffeeMachine.row },
    };
  }

  return {
    generate,
    get _currentGrid() { return _currentGrid; },
  };
})();
