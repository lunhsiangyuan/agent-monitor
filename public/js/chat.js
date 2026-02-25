// chat.js - 渲染函數、Agent persona、Protocol 解析
// 所有函數皆為全域，供 app.js 呼叫

// ── Agent personality map ───────────────────────────────────────────────────
const AGENT_PERSONA = {
  'team-lead':        { emoji: '\u{1F451}', label: 'Team Lead',        color: '#5b6abf', side: 'left' },
  'style-engine':     { emoji: '\u{1F3A8}', label: 'Style Designer',   color: '#c2185b', side: 'left' },
  'asset-fetcher':    { emoji: '\u{1F50D}', label: 'Asset Hunter',     color: '#00897b', side: 'right' },
  'image-generator':  { emoji: '\u{1F5BC}\uFE0F', label: 'Image Maker',      color: '#f57c00', side: 'right' },
  'export-engine':    { emoji: '\u{1F4E6}', label: 'Packager',         color: '#7b1fa2', side: 'right' },
  'template-builder': { emoji: '\u{1F3D7}\uFE0F', label: 'Builder',          color: '#1565c0', side: 'left' },
  'coder':            { emoji: '\u{1F4BB}', label: 'Coder',            color: '#2e7d32', side: 'right' },
  'researcher':       { emoji: '\u{1F52C}', label: 'Researcher',       color: '#4527a0', side: 'left' },
  'writer':           { emoji: '\u270D\uFE0F', label: 'Writer',           color: '#6d4c41', side: 'right' },
  'analyst':          { emoji: '\u{1F4CA}', label: 'Analyst',          color: '#00695c', side: 'left' },
  'agent-a':          { emoji: '\u{1F170}\uFE0F', label: 'Agent A',          color: '#1565c0', side: 'left' },
  'agent-b':          { emoji: '\u{1F171}\uFE0F', label: 'Agent B',          color: '#2e7d32', side: 'right' },
  'agent-c':          { emoji: '\u00A9\uFE0F',  label: 'Agent C',          color: '#6a1fa2', side: 'left' },
  'agent-d':          { emoji: '\u{1F537}', label: 'Agent D',          color: '#ad1457', side: 'right' },
  'frontend':         { emoji: '\u{1F5A5}\uFE0F', label: 'Frontend',         color: '#0277bd', side: 'right' },
  'backend':          { emoji: '\u2699\uFE0F', label: 'Backend',          color: '#37474f', side: 'left' },
  'tester':           { emoji: '\u{1F9EA}', label: 'Tester',           color: '#558b2f', side: 'right' },
  'planner':          { emoji: '\u{1F5FA}\uFE0F', label: 'Planner',          color: '#4e342e', side: 'left' },
  'reviewer':         { emoji: '\u{1F441}\uFE0F', label: 'Reviewer',         color: '#0288d1', side: 'right' },
  'doctor':           { emoji: '\u{1FA7A}', label: 'Doctor',           color: '#00838f', side: 'left' },
  'nurse':            { emoji: '\u{1F48A}', label: 'Nurse',            color: '#ad1457', side: 'right' },
};

// ── Avatar palette for unknown agents (deterministic by name) ───────────────
const AVATAR_EMOJIS = ['\u{1F916}','\u{1F9BE}','\u{1F9E0}','\u{1F6F8}','\u26A1','\u{1F310}','\u{1F52E}','\u{1F3AF}','\u{1F680}','\u{1F984}','\u{1F42C}','\u{1F98A}'];
const AVATAR_COLORS = ['#5b6abf','#c2185b','#00897b','#f57c00','#7b1fa2','#1565c0','#2e7d32','#ad1457','#0277bd','#558b2f'];

// ── HTML 跳脫 ─────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── DiceBear face avatar ─────────────────────────────────────────────────────
function getAvatarImg(name, size, bg) {
  const seed = encodeURIComponent((name || 'agent').toLowerCase());
  const lower = (name || '').toLowerCase();
  let style = 'bottts';
  if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('surgeon')) style = 'adventurer';
  else if (lower.includes('writer') || lower.includes('analyst') || lower.includes('lead')) style = 'lorelei';
  else if (lower.includes('researcher') || lower.includes('planner')) style = 'personas';
  const bgParam = bg ? '&backgroundColor=' + encodeURIComponent(bg.replace('#','')) : '';
  const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}${bgParam}`;
  const s = size || 36;
  return `<img src="${url}" width="${s}" height="${s}" alt="${escHtml(name)}" style="border-radius:50%;display:block" loading="lazy" onerror="this.style.display='none';this.parentNode.dataset.fallback='1'">`;
}

function getPersona(name) {
  if (!name) return { emoji: '\u{1F916}', label: '?', color: '#607d8b', side: 'left' };
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(AGENT_PERSONA)) {
    if (lower.includes(key)) return { ...val };
  }
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const emoji = AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length];
  return { emoji, label: name, color, side: hash % 2 === 0 ? 'left' : 'right' };
}

// ── Per-team member side assignment (position-based) ─────────────────────────
const teamMemberOrder = {};   // teamName -> { agentName: 'left'|'right' }

function buildMemberSides(teamName, members) {
  const map = {};
  (members || []).forEach((m, i) => {
    const key = (m.name || m).toLowerCase();
    map[key] = i % 2 === 0 ? 'left' : 'right';
  });
  teamMemberOrder[teamName] = map;
}

function getAgentSide(fromName, teamName) {
  const map = teamMemberOrder[teamName] || {};
  const key = (fromName || '').toLowerCase();
  if (map[key] !== undefined) return map[key];
  for (const [k, side] of Object.entries(map)) {
    if (key.includes(k) || k.includes(key)) return side;
  }
  return getPersona(fromName).side || 'right';
}

// ── Protocol -> human language ───────────────────────────────────────────────
function humanizeProtocol(text, from) {
  try {
    const obj = JSON.parse(text);
    switch (obj.type) {
      case 'idle_notification':
        return { isSystem: true, text: `\u2705 ${getPersona(from).label} finished and is waiting` };
      case 'shutdown_request':
        return { isSystem: true, text: `\u{1F4E2} Team Lead is wrapping up \u2014 asking everyone to finish` };
      case 'shutdown_response': {
        const approved = obj.approve !== false;
        return { isSystem: true, text: approved
          ? `\u{1F44B} ${getPersona(from).label} signed off`
          : `\u23F3 ${getPersona(from).label} needs more time` };
      }
      case 'teammate_terminated':
        return { isSystem: true, text: `\u{1F50C} ${obj.message || 'Agent shut down'}` };
      case 'plan_approval_request':
        return { isSystem: true, text: `\u{1F4CB} ${getPersona(from).label} submitted a plan \u2014 awaiting approval` };
      case 'plan_approval_response':
        return { isSystem: true, text: obj.approve
          ? `\u2705 Plan approved \u2014 ${getPersona(from).label} can proceed`
          : `\u{1F504} Plan revised \u2014 feedback sent to ${getPersona(from).label}` };
      default:
        return { isSystem: true, text: `\u26A1 ${getPersona(from).label}: [${obj.type}]` };
    }
  } catch {}
  return null;
}

// ── Render: team card ─────────────────────────────────────────────────────────
function renderTeamCard(t) {
  const done = t.completedCount, running = t.inProgressCount;
  const allDone = t.taskCount > 0 && done === t.taskCount;
  const isActive = t.name === selectedTeam;
  const members = t.members || [];
  const memberHtml = members.map((m, i) => {
    const n = m.name || m;
    const p = getPersona(n);
    return `<div class="member-item">
      <div class="member-dot" style="background:${p.color}">${getAvatarImg(n, 28, p.color)}</div>
      <span class="member-name">${escHtml(p.label)}</span>
      <span style="font-size:10px;color:#555;margin-left:auto">${i%2===0?'\u25C0':'\u25B6'}</span>
    </div>`;
  }).join('');
  return `<div>
    <div class="team-card ${isActive?'active':''}" onclick="selectTeam('${escHtml(t.name)}')">
      <div class="team-card-name">
        ${allDone ? '\u2705 ' : '\u{1F504} '}${escHtml(t.name)}
        ${members.length ? '<span class="team-card-toggle '+(isActive?'open':'')+'" id="toggle_'+t.name+'">\u25BC</span>' : ''}
      </div>
      <div class="team-card-desc">${t.messageCount} msgs \u00B7 ${t.memberCount} agents</div>
      <div class="team-card-stats">
        ${t.taskCount ? '<span class="pill pill-blue">'+t.taskCount+' tasks</span>' : ''}
        ${done ? '<span class="pill pill-green">'+done+' done</span>' : ''}
        ${running ? '<span class="pill pill-orange">'+running+' active</span>' : ''}
      </div>
    </div>
    <div class="member-list ${isActive?'open':''}" id="members_${t.name}">${memberHtml}</div>
  </div>`;
}

// ── Render: sidebar ──────────────────────────────────────────────────────────
function renderTeamList() {
  const el = document.getElementById('teamList');
  if (!teams.length) {
    el.innerHTML = '<div style="padding:16px;color:#666;font-size:13px">No teams found</div>';
    return;
  }
  const sorted = [...teams].sort((a, b) => b.lastModified - a.lastModified);
  const active = sorted.slice(0, 1);
  const archived = sorted.slice(1);

  let html = '<div class="sidebar-section">Active Team</div>';
  html += active.map(renderTeamCard).join('');

  if (archived.length) {
    html += `<div class="archive-header" onclick="toggleArchive()">
      <span>Archive</span>
      <span style="display:flex;align-items:center;gap:6px">
        <span class="archive-count">${archived.length}</span>
        <span class="archive-chevron ${archiveOpen?'open':''}">\u25B6</span>
      </span>
    </div>
    <div id="archiveList" style="display:${archiveOpen?'block':'none'}">${archived.map(renderTeamCard).join('')}</div>`;
  }
  el.innerHTML = html;
}

function toggleArchive() {
  archiveOpen = !archiveOpen;
  renderTeamList();
}

// ── Render: chat (A on left, B on right by member order) ─────────────────────
function renderChat(messages, members) {
  const container = document.getElementById('chatMessages');
  const header = document.getElementById('chatHeader');
  header.style.display = 'flex';

  const team = teams.find(t => t.name === selectedTeam) || {};
  const persona = getPersona(selectedTeam);
  document.getElementById('chatAvatar').innerHTML = getAvatarImg(selectedTeam, 38, persona.color);
  document.getElementById('chatName').textContent = selectedTeam;
  document.getElementById('chatSub').textContent = (team.memberCount||0) + ' agents \u00B7 ' + messages.length + ' messages';

  if (!messages.length) {
    container.innerHTML = '<div class="empty-state"><span>\u{1F4ED}</span>No messages yet</div>';
    return;
  }

  const groups = [];
  let lastFrom = null, lastDay = null;
  for (const msg of messages) {
    const day = new Date(msg.timestamp).toLocaleDateString('en', {month:'short',day:'numeric'});
    if (day !== lastDay) { groups.push({ type: 'date', label: day }); lastDay = day; }

    const proto = humanizeProtocol(msg.text, msg.from);
    if (proto) { groups.push({ type: 'system', text: proto.text, ts: msg.timestamp }); lastFrom = null; continue; }

    const side = getAgentSide(msg.from, selectedTeam);
    const dir = side === 'left' ? 'incoming' : 'outgoing';

    if (msg.from !== lastFrom) {
      groups.push({ type: 'group', dir, from: msg.from, to: msg.to, bubbles: [] });
      lastFrom = msg.from;
    }
    groups[groups.length-1].bubbles?.push(msg);
  }

  let html = '';
  for (const g of groups) {
    if (g.type === 'date') {
      html += `<div class="date-divider"><span>${g.label}</span></div>`;
    } else if (g.type === 'system') {
      const t = new Date(g.ts).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
      html += `<div class="msg-group system-event"><div class="event-pill">${escHtml(g.text)} <span style="opacity:.5">${t}</span></div></div>`;
    } else {
      const p = getPersona(g.from);
      html += `<div class="msg-group ${g.dir}">`;
      html += `<div class="msg-sender-label">${escHtml(p.label)}</div>`;
      for (let i = 0; i < g.bubbles.length; i++) {
        const b = g.bubbles[i];
        const showAvatar = i === g.bubbles.length - 1;
        const t = new Date(b.timestamp).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
        const isLong = b.text.length > 280;
        const msgId = 'b_' + Math.random().toString(36).slice(2);
        html += `<div class="bubble-row">
          <div class="avatar" style="background:${p.color};visibility:${showAvatar?'visible':'hidden'}">${getAvatarImg(g.from, 36, p.color)}</div>
          <div class="bubble ${g.dir==='outgoing'?'out':'in'}">
            ${b.summary ? '<div class="bubble-summary">'+escHtml(b.summary)+'</div>' : ''}
            <div class="bubble-body${isLong?'':' expanded'}" id="${msgId}">${escHtml(b.text)}</div>
            ${isLong ? '<div class="bubble-more" onclick="toggleMore(this,\''+msgId+'\')">Read more\u2026</div>' : ''}
            <div class="bubble-time">${t}</div>
          </div>
        </div>`;
      }
      html += '</div>';
    }
  }

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

function toggleMore(btn, id) {
  const el = document.getElementById(id);
  el.classList.toggle('expanded');
  btn.textContent = el.classList.contains('expanded') ? 'Show less' : 'Read more\u2026';
}

// ── Render: tasks ─────────────────────────────────────────────────────────────
function renderTasks(tasks) {
  const panel = document.getElementById('tasksPanel');
  if (!tasks.length) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  const done = tasks.filter(t=>t.status==='completed').length;
  const running = tasks.filter(t=>t.status==='in_progress').length;
  const pending = tasks.filter(t=>t.status==='pending').length;
  document.getElementById('taskSummary').textContent =
    [done&&(done+' done'), running&&(running+' in progress'), pending&&(pending+' waiting')].filter(Boolean).join(' \u00B7 ');
  const icons = { pending:'\u23F3', in_progress:'\u{1F504}', completed:'\u2705' };
  document.getElementById('taskPills').innerHTML = tasks.map(t => {
    return `<div class="task-item ${t.status==='completed'?'done':''}" title="${escHtml((t.description||'').slice(0,120))}">
      <span>${icons[t.status]||'\u2753'}</span>
      <span class="task-name">${escHtml(t.subject||'Task')}</span>
    </div>`;
  }).join('');
}
