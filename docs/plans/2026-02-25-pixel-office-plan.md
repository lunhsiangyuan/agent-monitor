# Pixel Office Agent Monitor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 將現有 Agent Teams Monitor Dashboard 升級為像素風辦公室全景視圖，用 Canvas 2D 即時渲染 agent 角色、動畫、互動事件。

**Architecture:** 模組化靜態檔案架構。server.ts 瘦身為 API + static serving，前端拆成 HTML/CSS/JS 多檔。Canvas 2D game loop 渲染辦公室場景，JSON hex[][] sprite 格式（跟 Pixel Agents 一致），WebSocket event-level 推送驅動即時動畫。HTML overlay 層處理 toast 通知和 info card。

**Tech Stack:** Bun (server), Canvas 2D (rendering), vanilla JS (no framework), JSON sprite data, WebSocket

**Design Doc:** `docs/plans/2026-02-25-pixel-office-design.md`

**Note:** 這是視覺/創意專案，TDD 不完全適用。每個 Task 的驗證方式是啟動 server 後在瀏覽器中目視確認。

---

## Phase 1: Foundation — 重構 server.ts

### Task 1: 提取前端程式碼到靜態檔案

**Files:**
- Modify: `server.ts` — 移除 `getDashboardHTML()` 函數，加入 static file serving
- Create: `public/index.html` — 主頁面骨架
- Create: `public/css/base.css` — 從 server.ts `<style>` 提取
- Create: `public/js/chat.js` — 從 server.ts `<script>` 提取
- Create: `public/js/app.js` — WebSocket + API + state store

**Step 1: 建立 public/ 目錄結構**

```bash
mkdir -p public/css public/js/engine public/js/sprites public/js/office
```

**Step 2: 提取 CSS 到 `public/css/base.css`**

從 server.ts 第 183-310 行的 `<style>` 區塊，完整複製到 base.css。不做任何修改。

**Step 3: 提取 JS 到 `public/js/chat.js`**

從 server.ts 第 349-681 行的 `<script>` 區塊提取以下函數：
- `AGENT_PERSONA`, `AVATAR_EMOJIS`, `AVATAR_COLORS` → 常數
- `getAvatarImg()`, `getPersona()`, `buildMemberSides()`, `getAgentSide()` → persona 系統
- `humanizeProtocol()` → protocol 解析
- `renderChat()`, `renderTasks()`, `renderTeamCard()`, `renderTeamList()` → 渲染
- `toggleMore()`, `escHtml()`, `selectTeam()`, `toggleArchive()` → 輔助

匯出為全域函數（vanilla JS，不用 module）。

**Step 4: 建立 `public/js/app.js`**

提取 WebSocket 連線、API fetch、state management：
```javascript
// ── State ──
let selectedTeam = null;
let ws = null;
let teams = [];
let archiveOpen = false;
let currentView = 'office'; // 'office' | 'chat'

// ── WebSocket ──
function connectWS() {
  ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onopen = () => document.getElementById('wsDot').classList.add('on');
  ws.onclose = () => {
    document.getElementById('wsDot').classList.remove('on');
    setTimeout(connectWS, 3000);
  };
  ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'refresh') {
        loadTeams();
        if (selectedTeam && (msg.team === selectedTeam || msg.team === '*'))
          loadTeamData(selectedTeam);
      }
      if (msg.type === 'event' && currentView === 'office') {
        // 觸發辦公室動畫（Phase 7 實作）
        handleOfficeEvent(msg);
      }
    } catch {}
  };
}

// ── API ──
async function loadTeams() { /* 同原版 */ }
async function loadTeamData(name) { /* 同原版 + 新增 status fetch */ }

// ── Tab 切換 ──
function switchView(view) {
  currentView = view;
  document.getElementById('officeView').style.display = view === 'office' ? 'block' : 'none';
  document.getElementById('chatView').style.display = view === 'chat' ? 'flex' : 'none';
  document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
}

// ── Init ──
connectWS();
loadTeams().then(() => {
  if (teams.length > 0 && !selectedTeam) selectTeam(teams[0].name);
});
```

**Step 5: 建立 `public/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🤖 Agent Teams</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/ui-overlay.css">
</head>
<body>
<header>
  <div class="ws-dot" id="wsDot"></div>
  <h1>🤖 Agent Teams</h1>
  <div class="view-tabs">
    <button class="view-tab active" data-view="office" onclick="switchView('office')">🏢 Office</button>
    <button class="view-tab" data-view="chat" onclick="switchView('chat')">💬 Chat</button>
  </div>
  <span class="header-time" id="headerTime">—</span>
</header>
<div class="layout">
  <nav class="sidebar">
    <div id="teamList"><div style="padding:20px;color:#666;font-size:13px">Loading…</div></div>
  </nav>
  <div class="main-content">
    <!-- Office View (default) -->
    <div id="officeView" class="office-view">
      <canvas id="officeCanvas"></canvas>
      <div id="officeOverlay" class="office-overlay"></div>
    </div>
    <!-- Chat View (hidden by default) -->
    <div id="chatView" class="chat-wrap" style="display:none">
      <div class="chat-header" id="chatHeader" style="display:none">
        <div class="chat-header-avatar" id="chatAvatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-header-name" id="chatName">—</div>
          <div class="chat-header-sub" id="chatSub">—</div>
        </div>
      </div>
      <div class="chat-messages" id="chatMessages">
        <div class="empty-state"><span>💬</span>Select a team</div>
      </div>
    </div>
    <!-- Tasks Panel (shared) -->
    <div class="tasks-panel" id="tasksPanel" style="display:none">
      <div class="tasks-title">
        <span>📋 Tasks</span>
        <span id="taskSummary" style="font-weight:400;text-transform:none;letter-spacing:0"></span>
      </div>
      <div class="task-pills" id="taskPills"></div>
    </div>
  </div>
</div>
<!-- Toast 容器 -->
<div id="toastContainer" class="toast-container"></div>

<script src="/js/chat.js"></script>
<script src="/js/engine/gameLoop.js"></script>
<script src="/js/engine/renderer.js"></script>
<script src="/js/engine/pathfinding.js"></script>
<script src="/js/sprites/characters.js"></script>
<script src="/js/sprites/furniture.js"></script>
<script src="/js/sprites/floors.js"></script>
<script src="/js/office/layout.js"></script>
<script src="/js/office/characters.js"></script>
<script src="/js/office/effects.js"></script>
<script src="/js/notifications.js"></script>
<script src="/js/app.js"></script>
</body>
</html>
```

**Step 6: 修改 server.ts — 加入 static serving，移除 getDashboardHTML()**

```typescript
import { readdir, readFile, watch, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const TEAMS_DIR = join(process.env.HOME!, ".claude/teams");
const TASKS_DIR = join(process.env.HOME!, ".claude/tasks");
const PUBLIC_DIR = join(import.meta.dir, "public");
const PORT = 3333;

// ... (保留所有型別定義和資料讀取函數)

// 移除整個 getDashboardHTML() 函數

// 修改 handleRequest：
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // API routes（保留原有 + 新增 status）
  if (path === "/api/teams") { /* 同原版 */ }
  // ... 其他 API routes 不變

  // 新增 status endpoint（Task 14 實作）
  const statusMatch = path.match(/^\/api\/teams\/([^/]+)\/status$/);
  if (statusMatch) {
    if (!isValidTeamName(statusMatch[1])) return new Response("Invalid", { status: 400 });
    const status = await inferAgentStatus(statusMatch[1]);
    return Response.json(status);
  }

  // Static file serving
  if (path === "/" || path === "/index.html") {
    const html = await readFile(join(PUBLIC_DIR, "index.html"), "utf-8");
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // 靜態資源
  const filePath = join(PUBLIC_DIR, path);
  if (existsSync(filePath)) {
    const file = Bun.file(filePath);
    return new Response(file);
  }

  return new Response("Not Found", { status: 404 });
}
```

**Step 7: 驗證**

```bash
# 重啟 server
pkill -f "bun.*agent-monitor" 2>/dev/null; sleep 1
bun run ~/.claude/tools/agent-monitor/server.ts &
# 開啟瀏覽器確認 sidebar + chat view 功能跟原來一樣
open http://localhost:3333
```

**Step 8: Commit**
```bash
cd ~/.claude/tools/agent-monitor
git init && git add -A
git commit -m "refactor: extract inline HTML/CSS/JS to modular static files"
```

---

## Phase 2: Canvas Engine

### Task 2: Game Loop + Canvas 骨架

**Files:**
- Create: `public/js/engine/gameLoop.js`

**Step 1: 實作 game loop**

```javascript
// ── Game Loop ──
const GameLoop = (() => {
  let canvas, ctx;
  let lastTime = 0;
  let running = false;
  const FPS = 30; // 像素風不需要 60fps
  const FRAME_DURATION = 1000 / FPS;

  // 所有可更新/可繪製的物件
  const entities = [];

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    // DPR 感知
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false; // 像素完美
    running = true;
    requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (!running) return;
    const delta = timestamp - lastTime;
    if (delta >= FRAME_DURATION) {
      lastTime = timestamp - (delta % FRAME_DURATION);
      update(delta);
      render();
    }
    requestAnimationFrame(loop);
  }

  function update(delta) {
    for (const entity of entities) {
      if (entity.update) entity.update(delta);
    }
  }

  function render() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    // Z-Y 排序
    const drawables = entities.filter(e => e.draw);
    drawables.sort((a, b) => (a.zY || 0) - (b.zY || 0));
    for (const d of drawables) {
      d.draw(ctx);
    }
  }

  function addEntity(e) { entities.push(e); }
  function removeEntity(e) {
    const i = entities.indexOf(e);
    if (i >= 0) entities.splice(i, 1);
  }
  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;
  }
  function getCtx() { return ctx; }
  function getCanvas() { return canvas; }
  function stop() { running = false; }

  return { init, addEntity, removeEntity, resize, getCtx, getCanvas, stop };
})();

window.addEventListener('resize', () => GameLoop.resize());
```

**Step 2: 驗證**
- 開啟瀏覽器，Office tab 應該顯示空的黑色 canvas（佔滿主區域）
- console 無錯誤

---

### Task 3: Renderer — Sprite 繪製工具

**Files:**
- Create: `public/js/engine/renderer.js`

**Step 1: 實作像素 sprite 繪製器**

```javascript
// ── Renderer: 將 JSON hex[][] 畫到 canvas ──
const Renderer = (() => {
  const TILE_SIZE = 16;
  const SCALE = 3; // 16px × 3 = 48px 顯示大小，適合現代螢幕

  // 將 hex[][] sprite 繪製到 canvas
  function drawSprite(ctx, sprite, x, y, scale) {
    const s = scale || SCALE;
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const color = sprite[row][col];
        if (!color || color === '') continue; // 透明
        ctx.fillStyle = color;
        ctx.fillRect(x + col * s, y + row * s, s, s);
      }
    }
  }

  // 水平鏡像 sprite（用於 LEFT 方向）
  function flipHorizontal(sprite) {
    return sprite.map(row => [...row].reverse());
  }

  // 調色盤替換：將 sprite 中的顏色替換為新調色盤
  function recolor(sprite, fromPalette, toPalette) {
    const map = {};
    for (const key of Object.keys(fromPalette)) {
      if (fromPalette[key] && toPalette[key]) {
        map[fromPalette[key].toUpperCase()] = toPalette[key];
      }
    }
    return sprite.map(row =>
      row.map(color => {
        if (!color) return color;
        return map[color.toUpperCase()] || color;
      })
    );
  }

  // HSL hue shift（超過 6 人時用）
  function hueShift(hex, degrees) {
    if (!hex || hex === '') return hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    h = ((h * 360 + degrees) % 360) / 360;
    // HSL → RGB
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r2, g2, b2;
    if (s === 0) { r2 = g2 = b2 = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r2 = hue2rgb(p, q, h + 1/3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1/3);
    }
    const toHex = v => Math.round(v * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r2) + toHex(g2) + toHex(b2);
  }

  // Colorize（地板磚用）
  function colorize(sprite, hue, saturation, contrast, brightness) {
    return sprite.map(row => row.map(color => {
      if (!color) return color;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lum = 0.5 + (lum - 0.5) * (contrast || 1);
      lum += (brightness || 0) / 200;
      lum = Math.max(0, Math.min(1, lum));
      // 用固定 hue + saturation 重建顏色
      const h = (hue || 0) / 360;
      const s = (saturation || 50) / 100;
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      const q = lum < 0.5 ? lum * (1 + s) : lum + s - lum * s;
      const p = 2 * lum - q;
      const r2 = Math.round(hue2rgb(p, q, h + 1/3) * 255);
      const g2 = Math.round(hue2rgb(p, q, h) * 255);
      const b2 = Math.round(hue2rgb(p, q, h - 1/3) * 255);
      const toHex = v => v.toString(16).padStart(2, '0');
      return '#' + toHex(r2) + toHex(g2) + toHex(b2);
    }));
  }

  return { TILE_SIZE, SCALE, drawSprite, flipHorizontal, recolor, hueShift, colorize };
})();
```

**Step 2: 驗證** — 在 console 測試 `Renderer.drawSprite()` 畫一個簡單的 2×2 方塊

---

### Task 4: BFS 尋路

**Files:**
- Create: `public/js/engine/pathfinding.js`

```javascript
// ── BFS Pathfinding ──
const Pathfinding = (() => {
  // grid: 2D boolean array, true = walkable
  function findPath(grid, startCol, startRow, endCol, endRow) {
    if (startCol === endCol && startRow === endRow) return [];
    const rows = grid.length, cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ col: startCol, row: startRow, path: [] }];
    visited[startRow][startCol] = true;
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]]; // up,down,left,right
    while (queue.length > 0) {
      const { col, row, path } = queue.shift();
      for (const [dc, dr] of dirs) {
        const nc = col + dc, nr = row + dr;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        if (visited[nr][nc] || !grid[nr][nc]) continue;
        const newPath = [...path, { col: nc, row: nr }];
        if (nc === endCol && nr === endRow) return newPath;
        visited[nr][nc] = true;
        queue.push({ col: nc, row: nr, path: newPath });
      }
    }
    return []; // 無路可走
  }
  return { findPath };
})();
```

**Step 3: Commit**
```bash
git add -A && git commit -m "feat: canvas game loop, renderer, and BFS pathfinding engine"
```

---

## Phase 3: Sprite Data

### Task 5: 角色 Sprite 定義

**Files:**
- Create: `public/js/sprites/characters.js`

定義 6 個角色的 16×24 像素 sprite data。每個角色有 DOWN/UP/RIGHT 三組（LEFT = flipHorizontal(RIGHT)），每組有 walk(3 frames), type(2 frames), read(2 frames)。

```javascript
// ── Character Sprites ──
// 格式：string[][] — 每個像素是 '#RRGGBB' 或 '' (透明)
// 尺寸：16 wide × 24 tall
// 模板使用佔位顏色，透過 Renderer.recolor() 替換

const CharacterSprites = (() => {
  // 模板佔位顏色（會被 palette 替換）
  const T = {
    SKIN: '#FFCC99',
    HAIR: '#553322',
    SHIRT: '#4488CC',
    PANTS: '#334466',
    SHOES: '#222222',
    EYE: '#000000',
    WHITE: '#FFFFFF',
  };

  // 6 組調色盤
  const PALETTES = [
    { skin: '#FFCC99', hair: '#553322', shirt: '#4488CC', pants: '#334466', shoes: '#222222' }, // 藍
    { skin: '#FFCC99', hair: '#8B4513', shirt: '#CC4444', pants: '#443333', shoes: '#1A1A1A' }, // 紅
    { skin: '#F5DEB3', hair: '#2F4F4F', shirt: '#44AA66', pants: '#2D4A3E', shoes: '#333333' }, // 綠
    { skin: '#DEB887', hair: '#1A1A2E', shirt: '#9966CC', pants: '#3D2E5C', shoes: '#2A2A2A' }, // 紫
    { skin: '#FFDAB9', hair: '#B8860B', shirt: '#CCAA44', pants: '#5C4A22', shoes: '#1A1A1A' }, // 黃
    { skin: '#FFE4C4', hair: '#A0522D', shirt: '#CC7744', pants: '#4A3322', shoes: '#222222' }, // 橙
  ];

  // ── DOWN 方向 (正面) ──

  // Walk Frame 1 (standing)
  // 這是 16×24 的完整像素定義
  // 實作時需要逐像素畫出角色
  // 以下用簡化格式表示結構，實際實作需填入完整 hex[][]
  const _  = ''; // 透明
  const SK = T.SKIN;
  const HR = T.HAIR;
  const SH = T.SHIRT;
  const PN = T.PANTS;
  const SZ = T.SHOES;
  const EY = T.EYE;
  const WH = T.WHITE;

  const DOWN_STAND = [
    // row 0-5: 頭部（頭髮 + 臉）
    [_,_,_,_,_,HR,HR,HR,HR,HR,HR,_,_,_,_,_],
    [_,_,_,_,HR,HR,HR,HR,HR,HR,HR,HR,_,_,_,_],
    [_,_,_,HR,HR,HR,HR,HR,HR,HR,HR,HR,HR,_,_,_],
    [_,_,_,HR,SK,SK,SK,SK,SK,SK,SK,SK,HR,_,_,_],
    [_,_,_,SK,SK,WH,EY,SK,SK,WH,EY,SK,SK,_,_,_],
    [_,_,_,SK,SK,SK,SK,SK,SK,SK,SK,SK,SK,_,_,_],
    // row 6-7: 下臉
    [_,_,_,_,SK,SK,SK,SK,SK,SK,SK,SK,_,_,_,_],
    [_,_,_,_,_,SK,SK,SK,SK,SK,SK,_,_,_,_,_],
    // row 8-14: 身體（上衣）
    [_,_,_,_,_,SH,SH,SH,SH,SH,SH,_,_,_,_,_],
    [_,_,_,_,SH,SH,SH,SH,SH,SH,SH,SH,_,_,_,_],
    [_,_,_,SK,SH,SH,SH,SH,SH,SH,SH,SH,SK,_,_,_],
    [_,_,_,SK,SH,SH,SH,SH,SH,SH,SH,SH,SK,_,_,_],
    [_,_,_,_,SK,SH,SH,SH,SH,SH,SH,SK,_,_,_,_],
    [_,_,_,_,_,SH,SH,SH,SH,SH,SH,_,_,_,_,_],
    [_,_,_,_,_,SH,SH,SH,SH,SH,SH,_,_,_,_,_],
    // row 15-19: 褲子
    [_,_,_,_,_,PN,PN,PN,PN,PN,PN,_,_,_,_,_],
    [_,_,_,_,_,PN,PN,PN,PN,PN,PN,_,_,_,_,_],
    [_,_,_,_,_,PN,PN,_,_,PN,PN,_,_,_,_,_],
    [_,_,_,_,_,PN,PN,_,_,PN,PN,_,_,_,_,_],
    [_,_,_,_,_,PN,PN,_,_,PN,PN,_,_,_,_,_],
    // row 20-23: 鞋子
    [_,_,_,_,SZ,SZ,SZ,_,_,SZ,SZ,SZ,_,_,_,_],
    [_,_,_,_,SZ,SZ,SZ,_,_,SZ,SZ,SZ,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];

  // Walk Frame 2 (left foot forward) — 修改腿部
  // Walk Frame 3 (right foot forward) — 鏡像 frame 2
  // Type Frame 1/2 — 手臂位置不同
  // Read Frame 1/2 — 微微左右看
  // Sleep Frame 1/2 — 頭趴下
  // Celebrate Frame 1/2/3 — 舉手
  // （每個 frame 是完整 16×24 hex[][]，此處省略重複，實作時逐一定義）

  // DOWN 方向所有 frames
  const DOWN = {
    walk: [DOWN_STAND, /* frame2 */, /* frame3 */],
    type: [/* frame1 */, /* frame2 */],
    read: [/* frame1 */, /* frame2 */],
    sleep: [/* frame1 */, /* frame2 */],
    celebrate: [/* frame1 */, /* frame2 */, /* frame3 */],
  };

  // UP + RIGHT 方向類似結構（省略）
  // LEFT = flipHorizontal(RIGHT)

  function getSprite(direction, animation, frame, paletteIndex) {
    // 1. 取得 template sprite
    // 2. 用 PALETTES[paletteIndex] recolor
    // 3. 如果 direction === 'left'，flipHorizontal
    // 回傳 hex[][]
  }

  function getPalette(index) {
    if (index < PALETTES.length) return PALETTES[index];
    // 超過 6 人：hue shift
    const base = PALETTES[index % PALETTES.length];
    const shift = 45 + ((index - PALETTES.length) * 60) % 270;
    return {
      skin: base.skin,
      hair: Renderer.hueShift(base.hair, shift),
      shirt: Renderer.hueShift(base.shirt, shift),
      pants: Renderer.hueShift(base.pants, shift),
      shoes: base.shoes,
    };
  }

  return { getSprite, getPalette, PALETTES, T };
})();
```

**注意**：實作時每個 animation frame 需要完整的 16×24 hex[][] 數據。這是最耗工的部分，建議用輔助腳本或從 Pixel Agents 源碼參考格式。

**Step 2: Commit**
```bash
git add -A && git commit -m "feat: character sprite data with 6 palettes and animation frames"
```

---

### Task 6: 家具 Sprite 定義

**Files:**
- Create: `public/js/sprites/furniture.js`

```javascript
const FurnitureSprites = (() => {
  const _ = '';
  // 每個家具是 hex[][] 格式
  // 尺寸標注在註解中

  // 辦公桌 32×32 (2×2 tiles)
  const DESK = [ /* 32 rows × 32 cols of hex values */ ];

  // 椅子 16×16 — 4 方向
  const CHAIR_DOWN = [ /* 16×16 */ ];
  const CHAIR_UP = [ /* 16×16 */ ];
  const CHAIR_RIGHT = [ /* 16×16 */ ];
  const CHAIR_LEFT = [ /* 16×16 */ ];

  // PC 螢幕 16×16
  const PC = [ /* 16×16 grey frame + blue screen */ ];

  // 書架 16×32
  const BOOKSHELF = [ /* 32 rows × 16 cols */ ];

  // 植物 16×24
  const PLANT = [ /* 24 rows × 16 cols */ ];

  // 咖啡機 16×24
  const COFFEE_MACHINE = [ /* 24 rows × 16 cols */ ];

  // 白板 32×16 (2×1 tiles)
  const WHITEBOARD = [ /* 16 rows × 32 cols */ ];

  // 窗戶 32×32 (2×2 tiles)
  const WINDOW = [ /* 32×32 with light rays */ ];

  // 時鐘 16×16
  const CLOCK = [ /* 16×16 round clock */ ];

  return {
    DESK, CHAIR_DOWN, CHAIR_UP, CHAIR_RIGHT, CHAIR_LEFT,
    PC, BOOKSHELF, PLANT, COFFEE_MACHINE, WHITEBOARD, WINDOW, CLOCK
  };
})();
```

---

### Task 7: 地板瓷磚

**Files:**
- Create: `public/js/sprites/floors.js`

```javascript
const FloorSprites = (() => {
  // 16×16 基礎地板瓷磚（灰階，用 Renderer.colorize 上色）
  const BASE_TILE = [
    // 16 rows × 16 cols of grey hex values
    // 交替明暗格子圖案
  ];

  // 牆壁瓷磚 16×16
  const WALL_TILE = [ /* darker pattern */ ];

  function getFloorTile(teamColor) {
    // teamColor: { hue, saturation }
    return Renderer.colorize(BASE_TILE, teamColor.hue, teamColor.saturation, 1.2, 10);
  }

  return { BASE_TILE, WALL_TILE, getFloorTile };
})();
```

**Commit:**
```bash
git add -A && git commit -m "feat: furniture, floor, and wall sprite data"
```

---

## Phase 4: Office Layout + Scene

### Task 8: 自動辦公室佈局引擎

**Files:**
- Create: `public/js/office/layout.js`

```javascript
const OfficeLayout = (() => {
  const T = Renderer.TILE_SIZE;
  const S = Renderer.SCALE;

  // 根據成員數生成辦公室配置
  // 回傳 { grid, desks[], decorations[], coffeeMachine, walkableGrid }
  function generate(memberCount) {
    // 辦公室大小（tiles）
    const cols = Math.max(16, 6 + memberCount * 4);
    const rows = 14;

    // walkable grid (true = 可走)
    const grid = Array.from({ length: rows }, () => Array(cols).fill(true));

    // 牆壁（row 0-1 不可走）
    for (let c = 0; c < cols; c++) { grid[0][c] = false; grid[1][c] = false; }

    // 放置辦公桌（每張桌 2×2 tiles）
    const desks = [];
    const desksPerRow = Math.ceil(memberCount / 2);
    const startCol = Math.floor((cols - desksPerRow * 4) / 2);

    for (let i = 0; i < memberCount; i++) {
      const deskRow = i < desksPerRow ? 3 : 8;    // 兩排
      const deskCol = startCol + (i % desksPerRow) * 4;
      desks.push({
        col: deskCol, row: deskRow,
        chairCol: deskCol, chairRow: deskRow + 2,  // 椅子在桌子下方
        pcCol: deskCol, pcRow: deskRow,             // PC 在桌上
        seatId: 'seat-' + i,
      });
      // 標記桌子區域不可走
      grid[deskRow][deskCol] = false;
      grid[deskRow][deskCol + 1] = false;
      grid[deskRow + 1][deskCol] = false;
      grid[deskRow + 1][deskCol + 1] = false;
    }

    // 裝飾物件
    const decorations = [];
    // 牆壁裝飾（row 1）
    decorations.push({ type: 'whiteboard', col: 2, row: 1 });
    decorations.push({ type: 'window', col: Math.floor(cols / 2) - 1, row: 0 });
    decorations.push({ type: 'clock', col: cols - 3, row: 1 });
    decorations.push({ type: 'bookshelf', col: cols - 2, row: 1 });
    // 地面裝飾
    decorations.push({ type: 'plant', col: 0, row: rows - 3 });
    decorations.push({ type: 'plant', col: cols - 1, row: rows - 3 });

    // 咖啡機
    const coffeeMachine = { col: Math.floor(cols / 2), row: rows - 3 };
    grid[coffeeMachine.row][coffeeMachine.col] = false;
    decorations.push({ type: 'coffee_machine', ...coffeeMachine });

    return { cols, rows, grid, desks, decorations, coffeeMachine };
  }

  return { generate };
})();
```

---

### Task 9: 場景繪製整合

**Files:**
- 在 `public/js/app.js` 中整合 layout → canvas

```javascript
// 在 loadTeamData 中：
async function loadTeamData(name) {
  const [msgRes, taskRes, cfgRes, statusRes] = await Promise.all([
    fetch('/api/teams/' + name + '/messages'),
    fetch('/api/teams/' + name + '/tasks'),
    fetch('/api/teams/' + name),
    fetch('/api/teams/' + name + '/status'),
  ]);
  const cfg = await cfgRes.json();
  const status = await statusRes.json();
  buildMemberSides(name, cfg.members);

  // 渲染 Chat
  renderChat(await msgRes.json(), cfg.members);
  renderTasks(await taskRes.json());

  // 初始化 Office
  if (currentView === 'office') {
    initOffice(cfg.members, status);
  }
}

function initOffice(members, statusList) {
  const layout = OfficeLayout.generate(members.length);
  // 清除舊 entities
  // 畫地板
  // 畫牆壁
  // 畫家具
  // 建立角色 entities
  OfficeCharacters.init(members, statusList, layout);
  GameLoop.init('officeCanvas');
}
```

**Commit:**
```bash
git add -A && git commit -m "feat: office layout engine with auto desk arrangement"
```

---

## Phase 5: Character State Machine + Animation

### Task 10: 角色控制器

**Files:**
- Create: `public/js/office/characters.js`

```javascript
const OfficeCharacters = (() => {
  const characters = []; // Character 物件陣列

  const STATES = {
    IDLE: 'idle',
    WORKING: 'working',     // typing
    READING: 'reading',
    SLEEPING: 'sleeping',
    GONE: 'gone',
    COFFEE: 'coffee',
    CHATTING: 'chatting',
    CELEBRATE: 'celebrate',
    WALKING: 'walking',
    FIDGET: 'fidget',
  };

  const FRAME_DURATIONS = {
    idle: 1500,
    working: 400,
    reading: 2000,
    sleeping: 2000,
    walking: 300,
    celebrate: 500,
    fidget: 800,
    chatting: 1000,
  };

  function createCharacter(member, index, layout) {
    const desk = layout.desks[index];
    const persona = getPersona(member.name);
    return {
      name: member.name,
      persona,
      paletteIndex: index,
      state: STATES.IDLE,
      direction: 'down',
      // 位置（像素座標）
      x: desk.chairCol * Renderer.TILE_SIZE * Renderer.SCALE,
      y: desk.chairRow * Renderer.TILE_SIZE * Renderer.SCALE,
      tileCol: desk.chairCol,
      tileRow: desk.chairRow,
      // 座位
      seatCol: desk.chairCol,
      seatRow: desk.chairRow,
      deskCol: desk.col,
      deskRow: desk.row,
      // 動畫
      frame: 0,
      frameTimer: 0,
      // 路徑
      path: [],
      moveProgress: 0,
      // 隨機行為計時
      idleTimer: 0,
      wanderTimer: Math.random() * 30000, // 第一次 fidget 隨機延遲
      // 任務資訊
      task: null,
      lastMsg: null,
      // Z-Y（深度排序）
      get zY() { return this.y + 24 * Renderer.SCALE; },

      update(delta) {
        this.frameTimer += delta;
        const dur = FRAME_DURATIONS[this.state] || 1000;
        if (this.frameTimer >= dur) {
          this.frameTimer = 0;
          this.advanceFrame();
        }
        if (this.state === STATES.WALKING) {
          this.updateMovement(delta);
        }
        if (this.state === STATES.IDLE || this.state === STATES.SLEEPING) {
          this.updateIdleBehavior(delta);
        }
      },

      advanceFrame() {
        const anim = this.getAnimationName();
        const maxFrames = this.getMaxFrames(anim);
        this.frame = (this.frame + 1) % maxFrames;
        // 一次性動畫（celebrate, fidget）播完回前一狀態
        if ((this.state === STATES.CELEBRATE || this.state === STATES.FIDGET) && this.frame === 0) {
          this.state = this._previousState || STATES.IDLE;
        }
      },

      getAnimationName() {
        switch (this.state) {
          case STATES.WORKING: return 'type';
          case STATES.READING: return 'read';
          case STATES.SLEEPING: return 'sleep';
          case STATES.WALKING: case STATES.COFFEE: return 'walk';
          case STATES.CELEBRATE: return 'celebrate';
          default: return 'walk'; // idle 用 walk frame 0
        }
      },

      getMaxFrames(anim) {
        const counts = { walk: 4, type: 2, read: 2, sleep: 2, celebrate: 3 };
        return counts[anim] || 2;
      },

      updateMovement(delta) {
        if (this.path.length === 0) {
          this.state = this._targetState || STATES.IDLE;
          return;
        }
        this.moveProgress += delta / 300; // 300ms per tile
        if (this.moveProgress >= 1) {
          const next = this.path.shift();
          this.tileCol = next.col;
          this.tileRow = next.row;
          this.x = next.col * Renderer.TILE_SIZE * Renderer.SCALE;
          this.y = next.row * Renderer.TILE_SIZE * Renderer.SCALE;
          this.moveProgress = 0;
          // 更新方向
          if (this.path.length > 0) {
            const n = this.path[0];
            if (n.col > this.tileCol) this.direction = 'right';
            else if (n.col < this.tileCol) this.direction = 'left';
            else if (n.row > this.tileRow) this.direction = 'down';
            else this.direction = 'up';
          }
        } else {
          // 插值移動
          if (this.path.length > 0) {
            const next = this.path[0];
            const tx = next.col * Renderer.TILE_SIZE * Renderer.SCALE;
            const ty = next.row * Renderer.TILE_SIZE * Renderer.SCALE;
            this.x = this.tileCol * Renderer.TILE_SIZE * Renderer.SCALE + (tx - this.tileCol * Renderer.TILE_SIZE * Renderer.SCALE) * this.moveProgress;
            this.y = this.tileRow * Renderer.TILE_SIZE * Renderer.SCALE + (ty - this.tileRow * Renderer.TILE_SIZE * Renderer.SCALE) * this.moveProgress;
          }
        }
      },

      updateIdleBehavior(delta) {
        this.wanderTimer -= delta;
        if (this.wanderTimer <= 0) {
          // 隨機觸發 fidget
          this._previousState = this.state;
          this.state = STATES.FIDGET;
          this.frame = 0;
          this.wanderTimer = 20000 + Math.random() * 40000; // 20-60s
        }
      },

      walkTo(col, row, targetState) {
        const path = Pathfinding.findPath(
          OfficeLayout._currentGrid, this.tileCol, this.tileRow, col, row
        );
        if (path.length > 0) {
          this.path = path;
          this.state = STATES.WALKING;
          this._targetState = targetState || STATES.IDLE;
          this.moveProgress = 0;
        }
      },

      goToCoffee(layout) {
        this.walkTo(layout.coffeeMachine.col, layout.coffeeMachine.row + 1, STATES.IDLE);
        // 到咖啡機後等 3 秒再走回座位（用 setTimeout 或 timer）
      },

      returnToSeat() {
        this.walkTo(this.seatCol, this.seatRow, this._targetState || STATES.IDLE);
      },

      draw(ctx) {
        if (this.state === STATES.GONE) return; // 不畫
        const sprite = CharacterSprites.getSprite(
          this.direction, this.getAnimationName(), this.frame, this.paletteIndex
        );
        if (sprite) {
          Renderer.drawSprite(ctx, sprite, this.x, this.y);
        }
        // 名牌
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Fira Code"';
        ctx.textAlign = 'center';
        ctx.fillText(
          this.persona.label || this.name,
          this.x + 8 * Renderer.SCALE,
          this.y - 4
        );
      },

      // 設定狀態（從 server status 推斷）
      setState(serverState) {
        const map = {
          'typing': STATES.WORKING,
          'reading': STATES.READING,
          'sleeping': STATES.SLEEPING,
          'gone': STATES.GONE,
          'coffee': STATES.COFFEE,
          'idle': STATES.IDLE,
        };
        const newState = map[serverState] || STATES.IDLE;
        if (this.state !== newState) {
          this.state = newState;
          this.frame = 0;
          this.frameTimer = 0;
        }
      },
    };
  }

  function init(members, statusList, layout) {
    characters.length = 0;
    OfficeLayout._currentGrid = layout.grid;
    members.forEach((m, i) => {
      const char = createCharacter(m, i, layout);
      const status = statusList.find(s => s.agent === m.name);
      if (status) char.setState(status.state);
      characters.push(char);
      GameLoop.addEntity(char);
    });
  }

  function getByName(name) {
    return characters.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  return { init, getByName, characters, STATES };
})();
```

**Commit:**
```bash
git add -A && git commit -m "feat: character state machine with walking, animation, and idle behavior"
```

---

## Phase 6: Server Enhancement

### Task 11: 狀態推斷 API + Event WebSocket

**Files:**
- Modify: `server.ts`

**Step 1: 新增 inferAgentStatus() 函數**

```typescript
interface AgentStatus {
  agent: string;
  state: 'typing' | 'reading' | 'sleeping' | 'gone' | 'coffee' | 'idle';
  task?: string;
  lastMsg?: string;
}

async function inferAgentStatus(teamName: string): Promise<AgentStatus[]> {
  const config = await readTeamConfig(teamName);
  const tasks = await readTeamTasks(teamName);
  const messages = await readTeamMessages(teamName);
  const now = Date.now();

  return config.members.map(member => {
    const name = member.name;
    const agentTasks = tasks.filter(t => t.owner === name);
    const agentMsgs = messages.filter(m => m.from === name);
    const lastMsg = agentMsgs[agentMsgs.length - 1];
    const lastMsgAge = lastMsg ? now - new Date(lastMsg.timestamp).getTime() : Infinity;

    // 推斷狀態（優先序）
    // 1. Shutdown
    if (lastMsg) {
      try {
        const obj = JSON.parse(lastMsg.text);
        if (obj.type === 'shutdown_response' && obj.approve !== false) {
          return { agent: name, state: 'gone' as const };
        }
        if (obj.type === 'idle_notification') {
          return { agent: name, state: 'sleeping' as const, lastMsg: formatAge(lastMsgAge) };
        }
      } catch {}
    }

    // 2. Working tasks
    const inProgress = agentTasks.find(t => t.status === 'in_progress');
    if (inProgress) {
      if (lastMsgAge < 120000) { // < 2 min
        return { agent: name, state: 'typing' as const, task: inProgress.subject, lastMsg: formatAge(lastMsgAge) };
      }
      return { agent: name, state: 'reading' as const, task: inProgress.subject, lastMsg: formatAge(lastMsgAge) };
    }

    // 3. Blocked
    const blocked = agentTasks.find(t => t.status === 'pending' && t.blockedBy?.length > 0);
    if (blocked) {
      return { agent: name, state: 'coffee' as const, task: blocked.subject };
    }

    // 4. Default
    return { agent: name, state: 'idle' as const, lastMsg: lastMsg ? formatAge(lastMsgAge) : undefined };
  });
}

function formatAge(ms: number): string {
  if (ms < 60000) return '<1min';
  if (ms < 3600000) return Math.floor(ms / 60000) + 'min';
  return Math.floor(ms / 3600000) + 'h';
}
```

**Step 2: 增強 WebSocket 事件推送**

修改 `scheduleRefresh()`，在 broadcast 前解析變化類型：

```typescript
async function detectAndBroadcastEvents(teamName: string) {
  // 比對前後狀態差異，推送具體事件
  // 簡化版：直接重新讀取並推送 event 類型
  const messages = await readTeamMessages(teamName);
  const lastMsg = messages[messages.length - 1];
  if (lastMsg) {
    broadcast({
      type: 'event',
      team: teamName,
      event: 'message',
      from: lastMsg.from,
      to: lastMsg.to,
      summary: lastMsg.summary || lastMsg.text.slice(0, 50),
      timestamp: lastMsg.timestamp,
    });
  }
  // 同時推送 refresh 確保數據同步
  broadcast({ type: 'refresh', team: teamName });
}
```

**Step 3: 新增 status route（在 handleRequest 中）**

```typescript
const statusMatch = path.match(/^\/api\/teams\/([^/]+)\/status$/);
if (statusMatch) {
  if (!isValidTeamName(statusMatch[1])) return new Response("Invalid", { status: 400 });
  const status = await inferAgentStatus(statusMatch[1]);
  return Response.json(status);
}
```

**Commit:**
```bash
git add -A && git commit -m "feat: agent status inference API and event-level WebSocket push"
```

---

## Phase 7: Effects System

### Task 12: 視覺特效引擎

**Files:**
- Create: `public/js/office/effects.js`

```javascript
const OfficeEffects = (() => {
  const effects = []; // 活躍中的特效

  // ── 信封飛行 ──
  function sendEnvelope(fromChar, toChar) {
    const startX = fromChar.x + 8 * Renderer.SCALE;
    const startY = fromChar.y;
    const endX = toChar.x + 8 * Renderer.SCALE;
    const endY = toChar.y;
    effects.push({
      type: 'envelope',
      x: startX, y: startY,
      startX, startY, endX, endY,
      progress: 0,
      duration: 1000, // 1 秒
      zY: 9999, // 最上層
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) {
          this.done = true;
          // 到達時觸發 toChar 頭上 💡
          spawnBubble(toChar, '💡', 1500);
          return;
        }
        // 拋物線插值
        const t = this.progress;
        this.x = this.startX + (this.endX - this.startX) * t;
        this.y = this.startY + (this.endY - this.startY) * t - Math.sin(t * Math.PI) * 60;
      },
      draw(ctx) {
        ctx.font = (12 * Renderer.SCALE / 3) + 'px serif';
        ctx.fillText('✉️', this.x, this.y);
      },
    });
    // 發送者頭上冒出 ✉️
    spawnBubble(fromChar, '✉️', 800);
  }

  // ── 頭上泡泡 ──
  function spawnBubble(char, emoji, duration) {
    effects.push({
      type: 'bubble',
      emoji,
      x: char.x + 8 * Renderer.SCALE,
      y: char.y - 10,
      startY: char.y - 10,
      progress: 0,
      duration: duration || 2000,
      zY: 9999,
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) { this.done = true; return; }
        this.y = this.startY - this.progress * 20; // 向上浮
        this.x = char.x + 8 * Renderer.SCALE; // 跟隨角色
      },
      draw(ctx) {
        const alpha = 1 - Math.max(0, (this.progress - 0.7) / 0.3);
        ctx.globalAlpha = alpha;
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.globalAlpha = 1;
      },
    });
  }

  // ── 星星粒子（任務完成）──
  function spawnCelebration(char) {
    const cx = char.x + 8 * Renderer.SCALE;
    const cy = char.y;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 40 + Math.random() * 30;
      effects.push({
        type: 'star',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 1,
        zY: 9999,
        update(delta) {
          const dt = delta / 1000;
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.vy += 60 * dt; // 重力
          this.life -= dt * 1.5;
          if (this.life <= 0) this.done = true;
        },
        draw(ctx) {
          ctx.globalAlpha = Math.max(0, this.life);
          ctx.fillStyle = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784'][i % 4];
          const s = 3 * this.life;
          ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
          ctx.globalAlpha = 1;
        },
      });
    }
  }

  // ── Zzz 粒子（睡覺）──
  function spawnZzz(char) {
    effects.push({
      type: 'zzz',
      char,
      x: char.x + 12 * Renderer.SCALE,
      y: char.y - 5,
      progress: 0,
      duration: 3000,
      zY: 9999,
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) {
          this.done = true;
          // 如果角色還在睡，再生一個
          if (this.char.state === OfficeCharacters.STATES.SLEEPING) {
            setTimeout(() => spawnZzz(this.char), 500);
          }
          return;
        }
        this.x = this.char.x + 12 * Renderer.SCALE + this.progress * 15;
        this.y = this.char.y - 5 - this.progress * 30;
      },
      draw(ctx) {
        const alpha = 1 - Math.max(0, (this.progress - 0.6) / 0.4);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#aaa';
        const size = 8 + this.progress * 6;
        ctx.font = size + 'px "Fira Code"';
        ctx.fillText('Z', this.x, this.y);
        ctx.globalAlpha = 1;
      },
    });
  }

  // ── 全場紅閃（Shutdown）──
  function flashRed() {
    effects.push({
      type: 'flash',
      progress: 0,
      duration: 2000,
      zY: 99999,
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) this.done = true;
      },
      draw(ctx) {
        const flash = Math.sin(this.progress * Math.PI * 6); // 3 次閃爍
        if (flash > 0) {
          ctx.fillStyle = `rgba(255, 50, 50, ${flash * 0.15})`;
          const canvas = GameLoop.getCanvas();
          const w = canvas.width / (window.devicePixelRatio || 1);
          const h = canvas.height / (window.devicePixelRatio || 1);
          ctx.fillRect(0, 0, w, h);
        }
      },
    });
  }

  // Game loop 整合
  const effectsEntity = {
    zY: 99999,
    update(delta) {
      for (const e of effects) {
        if (e.update) e.update(delta);
      }
      // 移除已完成的特效
      for (let i = effects.length - 1; i >= 0; i--) {
        if (effects[i].done) effects.splice(i, 1);
      }
    },
    draw(ctx) {
      for (const e of effects) {
        if (e.draw) e.draw(ctx);
      }
    },
  };

  function register() {
    GameLoop.addEntity(effectsEntity);
  }

  return { sendEnvelope, spawnBubble, spawnCelebration, spawnZzz, flashRed, register };
})();
```

**Commit:**
```bash
git add -A && git commit -m "feat: visual effects - envelope, particles, Zzz, celebration, red flash"
```

---

## Phase 8: UI Overlay

### Task 13: Toast 通知 + Info Card

**Files:**
- Create: `public/css/ui-overlay.css`
- Create: `public/js/notifications.js`

**ui-overlay.css:**
```css
/* View tabs */
.view-tabs { display: flex; gap: 4px; margin-left: 16px; }
.view-tab { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
.view-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.view-tab:hover { border-color: var(--accent); }

/* Office view */
.office-view { flex: 1; position: relative; overflow: hidden; background: #111; }
.office-view canvas { width: 100%; height: 100%; display: block; }
.office-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Toast 通知 */
.toast-container { position: fixed; top: 60px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.toast { background: var(--surface2); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 10px 16px; border-radius: 8px; font-size: 13px; color: var(--text); animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards; max-width: 320px; pointer-events: auto; }
@keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateX(40px); } }

/* Agent info card */
.agent-card { position: absolute; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; min-width: 220px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); pointer-events: auto; z-index: 100; animation: fadein 0.2s ease; }
.agent-card-name { font-weight: 700; font-size: 15px; color: #fff; margin-bottom: 8px; }
.agent-card-row { font-size: 12px; color: var(--text-muted); margin: 4px 0; }
.agent-card-btn { margin-top: 10px; background: var(--accent); color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; }
.agent-card-btn:hover { opacity: 0.8; }
```

**notifications.js:**
```javascript
const Notifications = (() => {
  function showToast(text, icon) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = (icon || '⚡') + ' ' + text;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function showAgentCard(char, screenX, screenY) {
    // 移除舊 card
    document.querySelectorAll('.agent-card').forEach(c => c.remove());
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.style.left = screenX + 'px';
    card.style.top = screenY + 'px';
    card.innerHTML = `
      <div class="agent-card-name">${char.persona.emoji || '🤖'} ${escHtml(char.persona.label || char.name)}</div>
      <div class="agent-card-row">Status: ${stateEmoji(char.state)} ${char.state}</div>
      ${char.task ? '<div class="agent-card-row">Task: ' + escHtml(char.task) + '</div>' : ''}
      ${char.lastMsg ? '<div class="agent-card-row">Last msg: ' + char.lastMsg + '</div>' : ''}
      <button class="agent-card-btn" onclick="switchView('chat')">View Chat ▸</button>
    `;
    card.style.pointerEvents = 'auto';
    document.getElementById('officeOverlay').appendChild(card);
    // 點擊其他地方關閉
    setTimeout(() => {
      document.addEventListener('click', function close(e) {
        if (!card.contains(e.target)) {
          card.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 100);
  }

  function stateEmoji(state) {
    const map = { working: '💻', reading: '📖', sleeping: '💤', gone: '🚪', coffee: '☕', idle: '🧘', chatting: '💬', celebrate: '🎉' };
    return map[state] || '❓';
  }

  return { showToast, showAgentCard };
})();
```

**在 app.js 中加入 canvas 點擊偵測：**
```javascript
document.getElementById('officeCanvas').addEventListener('click', (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // 檢查是否點到某個角色（碰撞偵測）
  for (const char of OfficeCharacters.characters) {
    const cw = 16 * Renderer.SCALE;
    const ch = 24 * Renderer.SCALE;
    if (x >= char.x && x <= char.x + cw && y >= char.y && y <= char.y + ch) {
      Notifications.showAgentCard(char, e.clientX, e.clientY);
      return;
    }
  }
  // 點空白處關閉 card
  document.querySelectorAll('.agent-card').forEach(c => c.remove());
});
```

**Commit:**
```bash
git add -A && git commit -m "feat: toast notifications, agent info cards, and canvas click detection"
```

---

## Phase 9: Event Integration

### Task 14: WebSocket 事件 → 辦公室動畫

**Files:**
- Modify: `public/js/app.js`

```javascript
function handleOfficeEvent(msg) {
  if (msg.event === 'message') {
    const from = OfficeCharacters.getByName(msg.from);
    const to = OfficeCharacters.getByName(msg.to);
    if (from && to) {
      OfficeEffects.sendEnvelope(from, to);
    }
    Notifications.showToast(`${msg.from} → ${msg.to}: ${msg.summary}`, '✉️');
  }

  if (msg.event === 'task_completed') {
    const char = OfficeCharacters.getByName(msg.agent);
    if (char) {
      char._previousState = char.state;
      char.state = OfficeCharacters.STATES.CELEBRATE;
      char.frame = 0;
      OfficeEffects.spawnCelebration(char);
    }
    Notifications.showToast(`${msg.agent} 完成：${msg.task}`, '✅');
  }

  if (msg.event === 'task_assigned') {
    const char = OfficeCharacters.getByName(msg.agent);
    if (char) {
      char.task = msg.task;
      char.setState('typing');
    }
    Notifications.showToast(`${msg.task} → ${msg.agent}`, '📋');
  }

  if (msg.event === 'shutdown') {
    OfficeEffects.flashRed();
    Notifications.showToast('Team Lead 正在收工', '📢');
  }

  // 狀態更新
  if (msg.event === 'status_change') {
    const char = OfficeCharacters.getByName(msg.agent);
    if (char) char.setState(msg.state);
  }
}

// 定期刷新狀態（補充 WebSocket 的事件）
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
        // 如果剛變成 sleeping 且沒有 Zzz，生成
        if (s.state === 'sleeping') {
          OfficeEffects.spawnZzz(char);
        }
      }
    }
  } catch {}
}, 5000); // 每 5 秒
```

---

### Task 15: 閒聊系統（兩個 idle agent 互動）

在 `office/characters.js` 或 app.js 中加入：

```javascript
// 每 30 秒檢查是否有 2+ idle agents 可以閒聊
setInterval(() => {
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
        setTimeout(() => {
          a.returnToSeat();
          b.state = OfficeCharacters.STATES.IDLE;
        }, 5000);
      }
    }, 3000);
  }
}, 30000);
```

**Commit:**
```bash
git add -A && git commit -m "feat: WebSocket event integration, idle chatting, and periodic status refresh"
```

---

## Final: 驗收清單

```bash
# 啟動 server
bun run ~/.claude/tools/agent-monitor/server.ts

# 瀏覽器開啟
open http://localhost:3333
```

確認項目：
- [ ] Sidebar team list 正常顯示
- [ ] Office tab 顯示像素辦公室場景
- [ ] 角色坐在桌前，根據狀態有不同動畫
- [ ] IDLE 角色偶爾伸懶腰
- [ ] SLEEPING 角色有 Zzz 粒子
- [ ] 切換到 Chat tab 訊息正常顯示
- [ ] 新訊息觸發信封飛行動畫 + toast
- [ ] 任務完成觸發慶祝動畫 + 星星
- [ ] 點擊角色彈出 info card
- [ ] 兩個 idle agent 偶爾走到一起聊天
- [ ] blocked agent 走到咖啡機
