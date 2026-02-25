// app.js - WebSocket、API、狀態管理、初始化
// 依賴 chat.js 中的全域函數（須先載入 chat.js）

// ── State ────────────────────────────────────────────────────────────────────
let selectedTeam = null;
let ws = null;
let teams = [];
let archiveOpen = false;
let currentView = 'chat'; // 預設顯示 chat，直到 office 建置完成

// ── View switching ──────────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.getElementById('officeView').style.display = view === 'office' ? 'block' : 'none';
  document.getElementById('chatView').style.display = view === 'chat' ? 'flex' : 'none';
  document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
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
  buildMemberSides(name, cfg.members);
  renderChat(await msgRes.json(), cfg.members);
  renderTasks(await taskRes.json());
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
