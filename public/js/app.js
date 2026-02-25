// app.js - WebSocket、API、狀態管理、辦公室場景繪製、初始化
// 依賴 chat.js 中的全域函數（須先載入 chat.js）
// 依賴 GameLoop, Renderer, FloorSprites, FurnitureSprites, OfficeLayout

// ── State ────────────────────────────────────────────────────────────────────
let selectedTeam = null;
let ws = null;
let teams = [];
let archiveOpen = false;
let currentView = 'chat'; // 預設顯示 chat，直到 office 建置完成
let currentLayout = null;  // 目前辦公室佈局
let currentMembers = [];   // 目前團隊成員列表

// ── 場景繪製常量 ─────────────────────────────────────────────────────────────
const TILE = Renderer.TILE_SIZE; // 16
const SC = Renderer.SCALE;       // 3
const TS = TILE * SC;            // 48 — 一個 tile 的像素尺寸

// ── Tile 快取（避免每幀重複 colorize）─────────────────────────────────────────
let _cachedFloorTile = null;
let _cachedWallTile = null;
const FLOOR_HUE = 220;
const FLOOR_SAT = 15;
const WALL_HUE = 220;

function getCachedFloorTile() {
  if (!_cachedFloorTile) _cachedFloorTile = FloorSprites.getFloorTile(FLOOR_HUE, FLOOR_SAT);
  return _cachedFloorTile;
}
function getCachedWallTile() {
  if (!_cachedWallTile) _cachedWallTile = FloorSprites.getWallTile(WALL_HUE);
  return _cachedWallTile;
}

// ── 裝飾類型 → Sprite 對應表 ────────────────────────────────────────────────
const DECORATION_SPRITE_MAP = {
  whiteboard:     FurnitureSprites.WHITEBOARD,
  window:         FurnitureSprites.WINDOW_SPRITE,
  clock:          FurnitureSprites.CLOCK,
  bookshelf:      FurnitureSprites.BOOKSHELF,
  plant:          FurnitureSprites.PLANT,
  coffee_machine: FurnitureSprites.COFFEE_MACHINE,
};

// ── 椅子方向 → Sprite 對應表 ────────────────────────────────────────────────
const CHAIR_SPRITE_MAP = {
  up:    FurnitureSprites.CHAIR_UP,
  down:  FurnitureSprites.CHAIR_DOWN,
  left:  FurnitureSprites.CHAIR_LEFT,
  right: FurnitureSprites.CHAIR_RIGHT,
};

// ── 場景 Entity 工廠函數 ────────────────────────────────────────────────────

/**
 * 建立地板 Entity — 繪製所有地板 tile（zY = 0，最底層）
 */
function createFloorEntity(layout) {
  const { cols, rows } = layout;
  return {
    zY: 0,
    draw(ctx) {
      const tile = getCachedFloorTile();
      // 地板覆蓋牆壁以下的所有行（row 2 到 rows-1）
      for (let r = 2; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          Renderer.drawSprite(ctx, tile, c * TS, r * TS);
        }
      }
    },
  };
}

/**
 * 建立牆壁 Entity — 繪製前 2 行牆壁 tile（zY = 0）
 */
function createWallEntity(layout) {
  const { cols } = layout;
  return {
    zY: 0,
    draw(ctx) {
      const tile = getCachedWallTile();
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < cols; c++) {
          Renderer.drawSprite(ctx, tile, c * TS, r * TS);
        }
      }
    },
  };
}

/**
 * 建立牆面裝飾 Entity（白板、窗戶、時鐘 — 掛在牆上）
 * zY 基於 row 位置，但牆面裝飾在前 2 行所以 zY 很低
 */
function createWallDecorationEntity(decoration) {
  const sprite = DECORATION_SPRITE_MAP[decoration.type];
  if (!sprite) return null;
  const px = decoration.col * TS;
  const py = decoration.row * TS;
  return {
    zY: decoration.row * TS + 1, // 牆面裝飾 zY 略高於牆壁本身
    draw(ctx) {
      Renderer.drawSprite(ctx, sprite, px, py);
    },
  };
}

/**
 * 建立桌子 Entity（含 PC 和椅子）
 * zY 基於桌子的 row 位置（底部），確保深度排序正確
 */
function createDeskEntity(desk) {
  const deskSprite = FurnitureSprites.DESK;
  const pcSprite = FurnitureSprites.PC;
  const chairSprite = CHAIR_SPRITE_MAP[desk.chairDirection] || FurnitureSprites.CHAIR_DOWN;

  const deskPx = desk.col * TS;
  const deskPy = desk.row * TS;
  const pcPx = desk.pcCol * TS;
  const pcPy = desk.pcRow * TS;
  const chairPx = desk.chairCol * TS;
  const chairPy = desk.chairRow * TS;

  // zY 使用桌子底部 row 的像素位置，確保前面的家具擋住後面的
  // 桌子佔 2 tiles 高，所以底部在 row+2
  const baseZY = (desk.row + 2) * TS;

  return {
    zY: baseZY,
    draw(ctx) {
      // 繪製桌子（32x32 sprite）
      Renderer.drawSprite(ctx, deskSprite, deskPx, deskPy);
      // 繪製 PC（在桌面上）
      Renderer.drawSprite(ctx, pcSprite, pcPx, pcPy);
      // 繪製椅子
      Renderer.drawSprite(ctx, chairSprite, chairPx, chairPy);
    },
  };
}

/**
 * 建立地面裝飾 Entity（書架、盆栽、咖啡機）
 * zY 基於 row 位置 + sprite 高度
 */
function createFloorDecorationEntity(decoration) {
  const sprite = DECORATION_SPRITE_MAP[decoration.type];
  if (!sprite) return null;
  const px = decoration.col * TS;
  const py = decoration.row * TS;

  // sprite 高度（以 tile 數計算）用於 zY
  const spriteHeightTiles = Math.ceil(sprite.length / TILE);
  const bottomRow = decoration.row + spriteHeightTiles;

  return {
    zY: bottomRow * TS,
    draw(ctx) {
      Renderer.drawSprite(ctx, sprite, px, py);
    },
  };
}

// ── 辦公室初始化 ─────────────────────────────────────────────────────────────

/**
 * 初始化辦公室場景
 * 生成佈局，建立所有 Entity 並加入 GameLoop
 * @param {Array} members - 團隊成員列表
 */
function initOffice(members) {
  // 清除上一次的場景
  GameLoop.clearEntities();

  // 清除 tile 快取（未來若不同團隊使用不同色調則需要）
  _cachedFloorTile = null;
  _cachedWallTile = null;

  const memberCount = (members || []).length;
  if (memberCount < 1) return;

  // 生成辦公室佈局
  const layout = OfficeLayout.generate(memberCount);
  currentLayout = layout;

  // ── 1. 地板（最底層）──
  GameLoop.addEntity(createFloorEntity(layout));

  // ── 2. 牆壁 ──
  GameLoop.addEntity(createWallEntity(layout));

  // ── 3. 裝飾物件 ──
  const wallTypes = new Set(['whiteboard', 'window', 'clock']);

  for (const deco of layout.decorations) {
    if (wallTypes.has(deco.type)) {
      // 牆面裝飾
      const entity = createWallDecorationEntity(deco);
      if (entity) GameLoop.addEntity(entity);
    } else {
      // 地面裝飾（書架、盆栽、咖啡機）
      const entity = createFloorDecorationEntity(deco);
      if (entity) GameLoop.addEntity(entity);
    }
  }

  // ── 4. 桌椅 + PC ──
  for (const desk of layout.desks) {
    GameLoop.addEntity(createDeskEntity(desk));
  }

  // ── 5. 角色 ──
  OfficeCharacters.init(members, null, layout);

  // ── 6. 啟動 GameLoop ──
  if (!GameLoop.isRunning()) {
    GameLoop.init('officeCanvas');
  } else {
    // 若已在運行，觸發一次 resize 以適配新佈局
    GameLoop.resize();
  }
}

// ── View switching ──────────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.getElementById('officeView').style.display = view === 'office' ? 'block' : 'none';
  document.getElementById('chatView').style.display = view === 'chat' ? 'flex' : 'none';
  document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));

  // 切換到 Office 視圖時初始化場景
  if (view === 'office' && selectedTeam && currentMembers.length > 0) {
    // 延遲一幀，確保 DOM display 已更新（canvas 需要可見才能正確 resize）
    requestAnimationFrame(() => {
      initOffice(currentMembers);
    });
  }

  // 切換離開 Office 時停止 GameLoop 以節省資源
  if (view !== 'office' && GameLoop.isRunning()) {
    GameLoop.stop();
  }
}

// ── WebSocket ────────────────────────────────────────────────────────────────
function connectWS() {
  ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onopen = () => document.getElementById('wsDot').classList.add('on');
  ws.onclose = () => { document.getElementById('wsDot').classList.remove('on'); setTimeout(connectWS, 3000); };
  ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'refresh') {
        loadTeams();
        if (selectedTeam && (msg.team === selectedTeam || msg.team === '*')) loadTeamData(selectedTeam);
      }
    } catch {}
  };
}

// ── API ──────────────────────────────────────────────────────────────────────
async function loadTeams() {
  const res = await fetch('/api/teams');
  teams = await res.json();
  renderTeamList();
  document.getElementById('headerTime').textContent = 'Updated ' + new Date().toLocaleTimeString('en', {hour:'2-digit',minute:'2-digit'});
}

async function loadTeamData(name) {
  const [msgRes, taskRes, cfgRes] = await Promise.all([
    fetch('/api/teams/' + name + '/messages'),
    fetch('/api/teams/' + name + '/tasks'),
    fetch('/api/teams/' + name),
  ]);
  const cfg = await cfgRes.json();
  currentMembers = cfg.members || [];
  buildMemberSides(name, currentMembers);
  renderChat(await msgRes.json(), currentMembers);
  renderTasks(await taskRes.json());

  // 若目前在 Office 視圖，更新場景
  if (currentView === 'office' && currentMembers.length > 0) {
    requestAnimationFrame(() => {
      initOffice(currentMembers);
    });
  }
}

function selectTeam(name) {
  selectedTeam = name;
  renderTeamList();
  loadTeamData(name);
}

// ── Init ─────────────────────────────────────────────────────────────────────
connectWS();
loadTeams().then(() => {
  if (teams.length > 0 && !selectedTeam) selectTeam(teams[0].name);
});
