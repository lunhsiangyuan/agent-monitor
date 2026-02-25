// app.js - WebSocket、API、狀態管理、辦公室場景繪製、初始化
// 依賴 chat.js 中的全域函數（須先載入 chat.js）
// 依賴 GameLoop, Renderer, TilesetSprites, FloorSprites, FurnitureSprites, OfficeLayout

// ── State ────────────────────────────────────────────────────────────────────
let selectedTeam = null;
let ws = null;
let teams = [];
let archiveOpen = false;
let currentView = 'chat'; // 預設顯示 chat，直到 office 建置完成
let currentMembers = [];   // 目前團隊成員列表

// ── 場景繪製常量 ─────────────────────────────────────────────────────────────
const TILE = Renderer.TILE_SIZE; // 16
const SC = Renderer.SCALE;       // 3
const TS = TILE * SC;            // 48 — 一個 tile 的像素尺寸

// ── Tileset 渲染輔助 ─────────────────────────────────────────────────────────
// 統一介面：自動判斷 tileset ref 或 legacy hex array
function drawAnySprite(ctx, sprite, x, y) {
  if (!sprite) return;
  if (sprite.sx !== undefined) {
    Renderer.drawTileSprite(ctx, TilesetSprites.getImage(), sprite, x, y);
  } else {
    Renderer.drawSprite(ctx, sprite, x, y);
  }
}

// 取得 sprite 的高度（game tiles）供 zY 深度排序
function getSpriteHeightTiles(sprite) {
  if (!sprite) return 1;
  if (sprite.heightTiles !== undefined) return sprite.heightTiles;
  return Math.ceil(sprite.length / TILE); // legacy hex array fallback
}

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

// ── 裝飾類型 → Sprite 對應表（優先使用 TilesetSprites）───────────────────────
const DECORATION_SPRITE_MAP = {
  whiteboard:     TilesetSprites.WHITEBOARD,
  window:         FurnitureSprites.WINDOW_SPRITE,  // tileset 無對應，保留 hex
  clock:          TilesetSprites.CLOCK,
  bookshelf:      TilesetSprites.BOOKSHELF,
  plant:          TilesetSprites.PLANT,
  coffee_machine: TilesetSprites.COFFEE_MACHINE,
};

// ── 椅子方向 → Sprite 對應表（TilesetSprites）──────────────────────────────
const CHAIR_SPRITE_MAP = {
  up:    TilesetSprites.CHAIR_UP,
  down:  TilesetSprites.CHAIR_DOWN,
  left:  TilesetSprites.CHAIR_LEFT,
  right: TilesetSprites.CHAIR_RIGHT,
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
      const img = TilesetSprites.getImage();
      const t = TilesetSprites.FLOOR_TILE;
      if (img && img.complete && img.naturalWidth) {
        // PNG tileset 地板（GPU 加速）
        for (let r = 2; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.drawImage(img, t.sx, t.sy, t.sw, t.sh, c * TS, r * TS, TS, TS);
          }
        }
      } else {
        // Fallback: colorized hex array
        const tile = getCachedFloorTile();
        for (let r = 2; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            Renderer.drawSprite(ctx, tile, c * TS, r * TS);
          }
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
      drawAnySprite(ctx, sprite, px, py);
    },
  };
}

/**
 * 建立桌子 Entity（含 PC 和椅子）
 * zY 基於桌子的 row 位置（底部），確保深度排序正確
 */
function createDeskEntity(desk) {
  const deskSprite = TilesetSprites.DESK;
  const pcSprite = TilesetSprites.PC;
  const chairSprite = CHAIR_SPRITE_MAP[desk.chairDirection] || TilesetSprites.CHAIR_DOWN;

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
      drawAnySprite(ctx, deskSprite,  deskPx,  deskPy);
      drawAnySprite(ctx, pcSprite,    pcPx,    pcPy);
      drawAnySprite(ctx, chairSprite, chairPx, chairPy);
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
  const bottomRow = decoration.row + getSpriteHeightTiles(sprite);

  return {
    zY: bottomRow * TS,
    draw(ctx) {
      drawAnySprite(ctx, sprite, px, py);
    },
  };
}

// ── Canvas 點擊偵測（角色 Info Card）──────────────────────────────────────────
function setupCanvasClickHandler() {
  const canvas = document.getElementById('officeCanvas');
  if (canvas._clickHandlerSet) return; // 防止重複綁定
  canvas._clickHandlerSet = true;
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 檢查是否點擊到角色
    for (const char of OfficeCharacters.characters) {
      const cw = 16 * Renderer.SCALE;
      const ch = 24 * Renderer.SCALE;
      if (x >= char.x && x <= char.x + cw && y >= char.y && y <= char.y + ch) {
        Notifications.showAgentCard(char, e.clientX, e.clientY);
        return;
      }
    }
    // 點擊空白處關閉所有 card
    document.querySelectorAll('.agent-card').forEach(c => c.remove());
  });
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

  // ── 1. 地板（最底層）──
  GameLoop.addEntity(createFloorEntity(layout));

  // ── 2. 牆壁 ──
  GameLoop.addEntity(createWallEntity(layout));

  // ── 3. 裝飾物件 ──
  const wallTypes = new Set(['whiteboard', 'window', 'clock']);

  for (const deco of layout.decorations) {
    const factory = wallTypes.has(deco.type) ? createWallDecorationEntity : createFloorDecorationEntity;
    const entity = factory(deco);
    if (entity) GameLoop.addEntity(entity);
  }

  // ── 4. 桌椅 + PC ──
  for (const desk of layout.desks) {
    GameLoop.addEntity(createDeskEntity(desk));
  }

  // ── 5. 角色 ──
  OfficeCharacters.init(members, null, layout);

  // ── 6. 視覺特效 ──
  OfficeEffects.register();

  // ── 7a. Canvas 點擊偵測（綁定一次）──
  setupCanvasClickHandler();

  // ── 7b. 啟動 GameLoop ──
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

// ── Office 事件處理 ──────────────────────────────────────────────────────────
function handleOfficeEvent(msg) {
  switch (msg.event) {
    case 'message': {
      const from = OfficeCharacters.getByName(msg.from);
      const to = OfficeCharacters.getByName(msg.to);
      if (from && to) OfficeEffects.sendEnvelope(from, to);
      Notifications.showToast(msg.from + ' → ' + msg.to + ': ' + msg.summary, '✉️');
      break;
    }
    case 'task_completed': {
      const char = OfficeCharacters.getByName(msg.agent);
      if (char) {
        char._previousState = char.state;
        char.state = OfficeCharacters.STATES.CELEBRATE;
        char.frame = 0;
        OfficeEffects.spawnCelebration(char);
      }
      Notifications.showToast(msg.agent + ' 完成：' + msg.task, '✅');
      break;
    }
    case 'task_assigned': {
      const char = OfficeCharacters.getByName(msg.agent);
      if (char) {
        char.task = msg.task;
        char.setState('typing');
      }
      Notifications.showToast(msg.task + ' → ' + msg.agent, '📋');
      break;
    }
    case 'shutdown':
      OfficeEffects.flashRed();
      Notifications.showToast('Team Lead 正在收工', '📢');
      break;
    case 'status_change': {
      const char = OfficeCharacters.getByName(msg.agent);
      if (char) char.setState(msg.state);
      break;
    }
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
      const isRelevant = selectedTeam && (msg.team === selectedTeam || msg.team === '*');
      if (msg.type === 'refresh') {
        loadTeams();
        if (isRelevant) loadTeamData(selectedTeam);
      } else if (msg.type === 'event' && currentView === 'office' && isRelevant) {
        handleOfficeEvent(msg);
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

// ── 定期狀態刷新（補充 WebSocket 事件）─────────────────────────────────────────
setInterval(async () => {
  if (!selectedTeam || currentView !== 'office') return;
  try {
    const res = await fetch('/api/teams/' + selectedTeam + '/status');
    const statusList = await res.json();
    for (const s of statusList) {
      const char = OfficeCharacters.getByName(s.agent);
      if (char) {
        char.setState(s.state);
        char.task = s.task;
        char.lastMsg = s.lastMsg;
        // 如果角色處於 sleeping 且還沒有 Zzz 特效（避免重複生成）
        if (s.state === 'sleeping' && !char._hasZzz) {
          char._hasZzz = true;
          OfficeEffects.spawnZzz(char);
        } else if (s.state !== 'sleeping') {
          char._hasZzz = false;
        }
      }
    }
  } catch {}
}, 5000);

// ── 閒聊系統（idle agent 互動）──────────────────────────────────────────────
setInterval(() => {
  if (currentView !== 'office') return;
  const idleChars = OfficeCharacters.characters.filter(c =>
    c.state === OfficeCharacters.STATES.IDLE && c.path.length === 0
  );
  if (idleChars.length >= 2 && Math.random() < 0.3) {
    const [a, b] = idleChars.sort(() => Math.random() - 0.5).slice(0, 2);
    // A 走到 B 旁邊
    a.walkTo(b.tileCol + 1, b.tileRow, OfficeCharacters.STATES.CHATTING);
    // 到達後開始聊天泡泡
    setTimeout(() => {
      if (a.state === OfficeCharacters.STATES.CHATTING) {
        OfficeEffects.spawnBubble(a, '💬', 2000);
        setTimeout(() => OfficeEffects.spawnBubble(b, '😄', 2000), 1500);
        // 5 秒後各自回座
        setTimeout(() => {
          a.returnToSeat();
          b.state = OfficeCharacters.STATES.IDLE;
        }, 5000);
      }
    }, 3000);
  }
}, 30000);
