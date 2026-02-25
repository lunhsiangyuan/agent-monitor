#!/usr/bin/env bun
/**
 * Agent Teams Monitor Dashboard
 * 即時監控所有 Claude Code Agent Teams 的訊息與任務狀態
 * 啟動：bun run ~/.claude/tools/agent-monitor/server.ts
 */

import { readdir, readFile, watch, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const TEAMS_DIR = join(process.env.HOME!, ".claude/teams");
const TASKS_DIR = join(process.env.HOME!, ".claude/tasks");
const PORT = 3333;

// ─── 型別定義 ──────────────────────────────────────────────────────────────

interface InboxMessage {
  from: string;
  to: string;       // 從 inbox filename 推導
  text: string;
  summary?: string;
  timestamp: string;
  color?: string;
  read?: boolean;
}

interface Task {
  id: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | string;
  blocks: string[];
  blockedBy: string[];
  owner?: string;
  activeForm?: string;
}

interface TeamInfo {
  name: string;
  description?: string;
  leadAgentId?: string;
  members: Array<{ name: string; agentId: string; agentType: string }>;
}

// ─── 資料讀取函數 ──────────────────────────────────────────────────────────

function isValidTeamName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name) && !name.includes("..");
}

// 輕量版：只計數訊息數量，不解析排序（給 /api/teams 用）
async function countTeamMessages(teamName: string): Promise<number> {
  const inboxDir = join(TEAMS_DIR, teamName, "inboxes");
  if (!existsSync(inboxDir)) return 0;
  let count = 0;
  try {
    const files = await readdir(inboxDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await readFile(join(inboxDir, file), "utf-8");
        if (!raw.trim()) continue;
        const msgs = JSON.parse(raw);
        if (Array.isArray(msgs)) count += msgs.length;
      } catch {}
    }
  } catch {}
  return count;
}

async function listTeams(): Promise<string[]> {
  if (!existsSync(TEAMS_DIR)) return [];
  try {
    const entries = await readdir(TEAMS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function readTeamConfig(teamName: string): Promise<TeamInfo> {
  const configPath = join(TEAMS_DIR, teamName, "config.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    if (!raw.trim()) throw new Error("empty");
    const config = JSON.parse(raw);
    return {
      name: teamName,
      description: config.description,
      leadAgentId: config.leadAgentId,
      members: config.members || [],
    };
  } catch {
    // config.json 不存在時，從 inboxes/ 推導成員列表
    const inboxDir = join(TEAMS_DIR, teamName, "inboxes");
    try {
      const files = await readdir(inboxDir);
      const members = files
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({ name: f.replace(".json", ""), agentId: "", agentType: "general-purpose" }));
      return { name: teamName, members };
    } catch {
      return { name: teamName, members: [] };
    }
  }
}

async function readTeamMessages(teamName: string): Promise<InboxMessage[]> {
  const inboxDir = join(TEAMS_DIR, teamName, "inboxes");
  if (!existsSync(inboxDir)) return [];

  let allMessages: InboxMessage[] = [];

  try {
    const files = await readdir(inboxDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const agentName = file.replace(".json", "");
      try {
        const raw = await readFile(join(inboxDir, file), "utf-8");
        if (!raw.trim()) continue;
        const messages: Omit<InboxMessage, "to">[] = JSON.parse(raw);
        if (!Array.isArray(messages)) continue;
        for (const msg of messages) {
          allMessages.push({ ...msg, to: agentName });
        }
      } catch {
        // 跳過無法解析的 inbox
      }
    }
  } catch {
    return [];
  }

  // 依時間排序
  allMessages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return allMessages;
}

async function readTeamTasks(teamName: string): Promise<Task[]> {
  const taskDir = join(TASKS_DIR, teamName);
  if (!existsSync(taskDir)) return [];

  const tasks: Task[] = [];
  try {
    const files = await readdir(taskDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await readFile(join(taskDir, file), "utf-8");
        if (!raw.trim()) continue;
        const task: Task = JSON.parse(raw);
        tasks.push(task);
      } catch {
        // 跳過無法解析的任務
      }
    }
  } catch {
    return [];
  }

  // 依 ID 數字排序
  tasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return tasks;
}

// ─── HTML Dashboard ────────────────────────────────────────────────────────

function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🤖 Agent Teams</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #000000;
    --surface: #0a0a0a;
    --surface2: #141414;
    --sidebar-bg: #0a0a0a;
    --sidebar-text: #e8e8e8;
    --sidebar-muted: #8b95a3;
    --sidebar-active: #1a1a1a;
    --border: #1e1e1e;
    --text: #f0f0f0;
    --text-muted: #b0b8c4;
    --accent: #38bdf8;
    --green: #34d399;
    --orange: #fbbf24;
    --red: #f87171;
    --purple: #a78bfa;
    --bubble-out: #0e4a7a;
    --bubble-out-text: #e0f2fe;
    --bubble-in: #1a1a1a;
    --bubble-in-text: #f0f0f0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Fira Sans', -apple-system, sans-serif; font-size: 14px; height: 100vh; display: flex; flex-direction: column; color-scheme: dark; }

  /* Header */
  header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  header h1 { font-size: 16px; font-weight: 600; color: #fff; letter-spacing: -0.3px; }
  .ws-dot { width: 8px; height: 8px; border-radius: 50%; background: #333; transition: all 0.3s; }
  .ws-dot.on { background: var(--green); box-shadow: 0 0 8px var(--green); }
  .header-time { margin-left: auto; font-size: 12px; color: var(--text-muted); font-family: 'Fira Code', monospace; }

  /* Layout */
  .layout { display: flex; flex: 1; overflow: hidden; }

  /* Sidebar */
  .sidebar { width: 260px; background: var(--surface); border-right: 1px solid var(--border); overflow-y: auto; flex-shrink: 0; }
  .sidebar-section { padding: 16px 16px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--sidebar-muted); font-weight: 600; }
  .team-card { padding: 12px 16px; cursor: pointer; border-left: 3px solid transparent; transition: all 0.15s; }
  .team-card:hover { background: var(--surface2); }
  .team-card.active { background: var(--sidebar-active); border-left-color: var(--accent); }
  .team-card-name { font-weight: 700; font-size: 14px; color: #fff; }
  .team-card-desc { font-size: 12px; color: var(--sidebar-muted); margin-top: 4px; }
  .team-card-stats { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .pill { font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: 700; letter-spacing: 0.02em; }
  .pill-blue { background: rgba(56,189,248,0.15); color: var(--accent); }
  .pill-green { background: rgba(52,211,153,0.15); color: var(--green); }
  .pill-orange { background: rgba(251,191,36,0.15); color: var(--orange); }

  /* Agent member list (dropdown) */
  .team-card-toggle { font-size: 10px; color: var(--sidebar-muted); float: right; transition: transform 0.2s; }
  .team-card-toggle.open { transform: rotate(180deg); }
  .member-list { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
  .member-list.open { max-height: 300px; }
  .member-item { display: flex; align-items: center; gap: 8px; padding: 6px 16px 6px 28px; font-size: 12px; }
  .member-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; color: #fff; font-weight: 600; overflow: hidden; }
  .member-dot img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .member-name { color: var(--sidebar-text); font-weight: 500; }

  /* Chat area */
  .chat-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
  .chat-header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .chat-header-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .chat-header-info { flex: 1; }
  .chat-header-name { font-weight: 700; font-size: 15px; color: #fff; }
  .chat-header-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; }
  .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 8px; }
  .empty-state span { font-size: 40px; }

  /* Date divider */
  .date-divider { text-align: center; margin: 16px 0 10px; }
  .date-divider span { background: var(--surface2); border: 1px solid var(--border); padding: 4px 14px; border-radius: 12px; font-size: 11px; color: var(--text-muted); font-weight: 500; }

  /* Message groups & bubbles */
  .msg-group { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }
  .msg-group.outgoing { align-items: flex-end; }
  .msg-group.incoming { align-items: flex-start; }
  .msg-group.system-event { align-items: center; }

  .msg-sender-label { font-size: 11px; color: var(--text-muted); margin-bottom: 3px; padding: 0 4px; font-weight: 500; }
  .msg-group.outgoing .msg-sender-label { text-align: right; }

  .bubble-row { display: flex; align-items: flex-end; gap: 8px; max-width: 72%; }
  .msg-group.outgoing .bubble-row { flex-direction: row-reverse; }

  .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; font-weight: 700; color: #fff; overflow: hidden; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .chat-header-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

  .bubble { padding: 10px 14px; border-radius: 16px; line-height: 1.6; font-size: 14px; position: relative; word-break: break-word; }
  .bubble.out { background: var(--bubble-out); color: var(--bubble-out-text); border-bottom-right-radius: 4px; }
  .bubble.in { background: var(--bubble-in); color: var(--bubble-in-text); border-bottom-left-radius: 4px; border: 1px solid var(--border); }
  .bubble-time { font-size: 10px; color: var(--text-muted); margin-top: 4px; font-family: 'Fira Code', monospace; }
  .bubble.out .bubble-time { text-align: right; }
  .bubble-summary { font-weight: 700; margin-bottom: 5px; font-size: 13px; color: var(--accent); }
  .bubble.out .bubble-summary { color: #7dd3fc; }
  .bubble-body { font-size: 13px; max-height: 100px; overflow: hidden; transition: max-height 0.3s; white-space: pre-wrap; line-height: 1.7; }
  .bubble-body.expanded { max-height: 800px; }
  .bubble-more { font-size: 11px; cursor: pointer; margin-top: 6px; color: var(--accent); font-weight: 600; }
  .bubble-more:hover { text-decoration: underline; }

  /* System event pill */
  .event-pill { background: var(--surface2); border: 1px solid var(--border); padding: 6px 16px; border-radius: 20px; font-size: 12px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }

  /* Tasks panel */
  .tasks-panel { background: var(--surface); border-top: 1px solid var(--border); padding: 14px 20px; flex-shrink: 0; }
  .tasks-title { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .task-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .task-item { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 12px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); cursor: default; transition: border-color 0.2s; }
  .task-item:hover { border-color: var(--accent); }
  .task-item.done { opacity: 0.5; }
  .task-name { font-weight: 600; }

  @keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .bubble { animation: fadein 0.2s ease; }

  /* Archive section */
  .archive-header { padding: 10px 16px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--sidebar-muted); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; border-top: 1px solid var(--border); margin-top: 4px; }
  .archive-header:hover { color: var(--text-muted); }
  .archive-chevron { font-size: 9px; transition: transform 0.2s; }
  .archive-chevron.open { transform: rotate(90deg); }
  .archive-count { background: var(--surface2); border: 1px solid var(--border); padding: 1px 7px; border-radius: 8px; font-size: 10px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
</style>
</head>
<body>
<header>
  <div class="ws-dot" id="wsDot"></div>
  <h1>🤖 Agent Teams</h1>
  <span class="header-time" id="headerTime">—</span>
</header>

<div class="layout">
  <nav class="sidebar">
    <div id="teamList"><div style="padding:20px;color:#666;font-size:13px">Loading…</div></div>
  </nav>

  <div class="chat-wrap">
    <div class="chat-header" id="chatHeader" style="display:none">
      <div class="chat-header-avatar" id="chatAvatar">🤖</div>
      <div class="chat-header-info">
        <div class="chat-header-name" id="chatName">—</div>
        <div class="chat-header-sub" id="chatSub">—</div>
      </div>
    </div>

    <div class="chat-messages" id="chatMessages">
      <div class="empty-state"><span>💬</span>Select a team to see the conversation</div>
    </div>

    <div class="tasks-panel" id="tasksPanel" style="display:none">
      <div class="tasks-title">
        <span>📋 Tasks</span>
        <span id="taskSummary" style="font-weight:400;text-transform:none;letter-spacing:0"></span>
      </div>
      <div class="task-pills" id="taskPills"></div>
    </div>
  </div>
</div>

<script>
// ── Agent personality map ───────────────────────────────────────────────────
const AGENT_PERSONA = {
  'team-lead':        { emoji: '👑', label: 'Team Lead',        color: '#5b6abf', side: 'left' },
  'style-engine':     { emoji: '🎨', label: 'Style Designer',   color: '#c2185b', side: 'left' },
  'asset-fetcher':    { emoji: '🔍', label: 'Asset Hunter',     color: '#00897b', side: 'right' },
  'image-generator':  { emoji: '🖼️', label: 'Image Maker',      color: '#f57c00', side: 'right' },
  'export-engine':    { emoji: '📦', label: 'Packager',         color: '#7b1fa2', side: 'right' },
  'template-builder': { emoji: '🏗️', label: 'Builder',          color: '#1565c0', side: 'left' },
  'coder':            { emoji: '💻', label: 'Coder',            color: '#2e7d32', side: 'right' },
  'researcher':       { emoji: '🔬', label: 'Researcher',       color: '#4527a0', side: 'left' },
  'writer':           { emoji: '✍️', label: 'Writer',           color: '#6d4c41', side: 'right' },
  'analyst':          { emoji: '📊', label: 'Analyst',          color: '#00695c', side: 'left' },
  'agent-a':          { emoji: '🅰️', label: 'Agent A',          color: '#1565c0', side: 'left' },
  'agent-b':          { emoji: '🅱️', label: 'Agent B',          color: '#2e7d32', side: 'right' },
  'agent-c':          { emoji: '©️',  label: 'Agent C',          color: '#6a1fa2', side: 'left' },
  'agent-d':          { emoji: '🔷', label: 'Agent D',          color: '#ad1457', side: 'right' },
  'frontend':         { emoji: '🖥️', label: 'Frontend',         color: '#0277bd', side: 'right' },
  'backend':          { emoji: '⚙️', label: 'Backend',          color: '#37474f', side: 'left' },
  'tester':           { emoji: '🧪', label: 'Tester',           color: '#558b2f', side: 'right' },
  'planner':          { emoji: '🗺️', label: 'Planner',          color: '#4e342e', side: 'left' },
  'reviewer':         { emoji: '👁️', label: 'Reviewer',         color: '#0288d1', side: 'right' },
  'doctor':           { emoji: '🩺', label: 'Doctor',           color: '#00838f', side: 'left' },
  'nurse':            { emoji: '💊', label: 'Nurse',            color: '#ad1457', side: 'right' },
};

// ── Avatar palette for unknown agents (deterministic by name) ───────────────
const AVATAR_EMOJIS = ['🤖','🦾','🧠','🛸','⚡','🌐','🔮','🎯','🚀','🦄','🐬','🦊'];
const AVATAR_COLORS = ['#5b6abf','#c2185b','#00897b','#f57c00','#7b1fa2','#1565c0','#2e7d32','#ad1457','#0277bd','#558b2f'];

// ── DiceBear face avatar ─────────────────────────────────────────────────────
// Returns an <img> HTML string for the agent face
function getAvatarImg(name, size, bg) {
  const seed = encodeURIComponent((name || 'agent').toLowerCase());
  const lower = (name || '').toLowerCase();
  // Pick style by role: medical → adventurer; human roles → personas; default → bottts
  let style = 'bottts';
  if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('surgeon')) style = 'adventurer';
  else if (lower.includes('writer') || lower.includes('analyst') || lower.includes('lead')) style = 'lorelei';
  else if (lower.includes('researcher') || lower.includes('planner')) style = 'personas';
  const bgParam = bg ? '&backgroundColor=' + encodeURIComponent(bg.replace('#','')) : '';
  const url = \`https://api.dicebear.com/9.x/\${style}/svg?seed=\${seed}\${bgParam}\`;
  const s = size || 36;
  return \`<img src="\${url}" width="\${s}" height="\${s}" alt="\${escHtml(name)}" style="border-radius:50%;display:block" loading="lazy" onerror="this.style.display='none';this.parentNode.dataset.fallback='1'">\`;
}

function getPersona(name) {
  if (!name) return { emoji: '🤖', label: '?', color: '#607d8b', side: 'left' };
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
// Even index (0,2,4…) → left; odd (1,3,5…) → right
const teamMemberOrder = {};   // teamName → { agentName: 'left'|'right' }

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
  // Direct lookup first
  if (map[key] !== undefined) return map[key];
  // Substring match
  for (const [k, side] of Object.entries(map)) {
    if (key.includes(k) || k.includes(key)) return side;
  }
  // Fallback to persona default
  return getPersona(fromName).side || 'right';
}

// ── Protocol → human language ───────────────────────────────────────────────
function humanizeProtocol(text, from) {
  try {
    const obj = JSON.parse(text);
    switch (obj.type) {
      case 'idle_notification':
        return { isSystem: true, text: \`✅ \${getPersona(from).label} finished and is waiting\` };
      case 'shutdown_request':
        return { isSystem: true, text: \`📢 Team Lead is wrapping up — asking everyone to finish\` };
      case 'shutdown_response': {
        const approved = obj.approve !== false;
        return { isSystem: true, text: approved
          ? \`👋 \${getPersona(from).label} signed off\`
          : \`⏳ \${getPersona(from).label} needs more time\` };
      }
      case 'teammate_terminated':
        return { isSystem: true, text: \`🔌 \${obj.message || 'Agent shut down'}\` };
      case 'plan_approval_request':
        return { isSystem: true, text: \`📋 \${getPersona(from).label} submitted a plan — awaiting approval\` };
      case 'plan_approval_response':
        return { isSystem: true, text: obj.approve
          ? \`✅ Plan approved — \${getPersona(from).label} can proceed\`
          : \`🔄 Plan revised — feedback sent to \${getPersona(from).label}\` };
      default:
        return { isSystem: true, text: \`⚡ \${getPersona(from).label}: [\${obj.type}]\` };
    }
  } catch {}
  return null;
}

// ── State ────────────────────────────────────────────────────────────────────
let selectedTeam = null;
let ws = null;
let teams = [];
let archiveOpen = false;

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

// ── Render: team card ─────────────────────────────────────────────────────────
function renderTeamCard(t) {
  const done = t.completedCount, running = t.inProgressCount;
  const allDone = t.taskCount > 0 && done === t.taskCount;
  const isActive = t.name === selectedTeam;
  const members = t.members || [];
  const memberHtml = members.map((m, i) => {
    const n = m.name || m;
    const p = getPersona(n);
    return \`<div class="member-item">
      <div class="member-dot" style="background:\${p.color}">\${getAvatarImg(n, 28, p.color)}</div>
      <span class="member-name">\${escHtml(p.label)}</span>
      <span style="font-size:10px;color:#555;margin-left:auto">\${i%2===0?'◀':'▶'}</span>
    </div>\`;
  }).join('');
  return \`<div>
    <div class="team-card \${isActive?'active':''}" onclick="selectTeam('\${escHtml(t.name)}')">
      <div class="team-card-name">
        \${allDone ? '✅ ' : '🔄 '}\${escHtml(t.name)}
        \${members.length ? '<span class="team-card-toggle '+(isActive?'open':'')+'" id="toggle_'+t.name+'">▼</span>' : ''}
      </div>
      <div class="team-card-desc">\${t.messageCount} msgs · \${t.memberCount} agents</div>
      <div class="team-card-stats">
        \${t.taskCount ? '<span class="pill pill-blue">'+t.taskCount+' tasks</span>' : ''}
        \${done ? '<span class="pill pill-green">'+done+' done</span>' : ''}
        \${running ? '<span class="pill pill-orange">'+running+' active</span>' : ''}
      </div>
    </div>
    <div class="member-list \${isActive?'open':''}" id="members_\${t.name}">\${memberHtml}</div>
  </div>\`;
}

// ── Render: sidebar ──────────────────────────────────────────────────────────
function renderTeamList() {
  const el = document.getElementById('teamList');
  if (!teams.length) {
    el.innerHTML = '<div style="padding:16px;color:#666;font-size:13px">No teams found</div>';
    return;
  }
  // newest team = active, rest = archive
  const sorted = [...teams].sort((a, b) => b.lastModified - a.lastModified);
  const active = sorted.slice(0, 1);
  const archived = sorted.slice(1);

  let html = '<div class="sidebar-section">Active Team</div>';
  html += active.map(renderTeamCard).join('');

  if (archived.length) {
    html += \`<div class="archive-header" onclick="toggleArchive()">
      <span>Archive</span>
      <span style="display:flex;align-items:center;gap:6px">
        <span class="archive-count">\${archived.length}</span>
        <span class="archive-chevron \${archiveOpen?'open':''}">▶</span>
      </span>
    </div>
    <div id="archiveList" style="display:\${archiveOpen?'block':'none'}">\${archived.map(renderTeamCard).join('')}</div>\`;
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
  document.getElementById('chatSub').textContent = (team.memberCount||0) + ' agents · ' + messages.length + ' messages';

  if (!messages.length) {
    container.innerHTML = '<div class="empty-state"><span>📭</span>No messages yet</div>';
    return;
  }

  const groups = [];
  let lastFrom = null, lastDay = null;
  for (const msg of messages) {
    const day = new Date(msg.timestamp).toLocaleDateString('en', {month:'short',day:'numeric'});
    if (day !== lastDay) { groups.push({ type: 'date', label: day }); lastDay = day; }

    const proto = humanizeProtocol(msg.text, msg.from);
    if (proto) { groups.push({ type: 'system', text: proto.text, ts: msg.timestamp }); lastFrom = null; continue; }

    // Assign side: left → 'incoming' CSS; right → 'outgoing' CSS
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
      html += \`<div class="date-divider"><span>\${g.label}</span></div>\`;
    } else if (g.type === 'system') {
      const t = new Date(g.ts).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
      html += \`<div class="msg-group system-event"><div class="event-pill">\${escHtml(g.text)} <span style="opacity:.5">\${t}</span></div></div>\`;
    } else {
      const p = getPersona(g.from);
      html += \`<div class="msg-group \${g.dir}">\`;
      html += \`<div class="msg-sender-label">\${escHtml(p.label)}</div>\`;
      for (let i = 0; i < g.bubbles.length; i++) {
        const b = g.bubbles[i];
        const showAvatar = i === g.bubbles.length - 1;
        const t = new Date(b.timestamp).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
        const isLong = b.text.length > 280;
        const msgId = 'b_' + Math.random().toString(36).slice(2);
        html += \`<div class="bubble-row">
          <div class="avatar" style="background:\${p.color};visibility:\${showAvatar?'visible':'hidden'}">\${getAvatarImg(g.from, 36, p.color)}</div>
          <div class="bubble \${g.dir==='outgoing'?'out':'in'}">
            \${b.summary ? '<div class="bubble-summary">'+escHtml(b.summary)+'</div>' : ''}
            <div class="bubble-body\${isLong?'':' expanded'}" id="\${msgId}">\${escHtml(b.text)}</div>
            \${isLong ? '<div class="bubble-more" onclick="toggleMore(this,\\''+msgId+'\\')">Read more…</div>' : ''}
            <div class="bubble-time">\${t}</div>
          </div>
        </div>\`;
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
  btn.textContent = el.classList.contains('expanded') ? 'Show less' : 'Read more…';
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
    [done&&(done+' done'), running&&(running+' in progress'), pending&&(pending+' waiting')].filter(Boolean).join(' · ');
  const icons = { pending:'⏳', in_progress:'🔄', completed:'✅' };
  document.getElementById('taskPills').innerHTML = tasks.map(t => {
    return \`<div class="task-item \${t.status==='completed'?'done':''}" title="\${escHtml((t.description||'').slice(0,120))}">
      <span>\${icons[t.status]||'❓'}</span>
      <span class="task-name">\${escHtml(t.subject||'Task')}</span>
    </div>\`;
  }).join('');
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
</script>
</body>
</html>`;
}

// ─── API 路由處理 ──────────────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Teams list — 輕量讀取，依最近活躍時間排序
  if (path === "/api/teams") {
    const teamNames = await listTeams();
    const teams = await Promise.all(
      teamNames.map(async (name) => {
        const config = await readTeamConfig(name);
        const tasks = await readTeamTasks(name);
        const messageCount = await countTeamMessages(name);
        let lastModified = 0;
        try {
          const inboxDir = join(TEAMS_DIR, name, "inboxes");
          const s = await stat(inboxDir);
          lastModified = s.mtimeMs;
        } catch {}
        // Fallback：沒有 inboxes 時用 config.json 建立時間
        if (lastModified === 0) {
          try {
            const configPath = join(TEAMS_DIR, name, "config.json");
            const s = await stat(configPath);
            lastModified = s.mtimeMs;
          } catch {}
        }
        return {
          name,
          memberCount: config.members.length,
          taskCount: tasks.length,
          completedCount: tasks.filter((t) => t.status === "completed").length,
          inProgressCount: tasks.filter((t) => t.status === "in_progress").length,
          messageCount,
          lastModified,
          members: config.members.map((m) => ({ name: m.name, type: m.agentType })),
        };
      })
    );
    teams.sort((a, b) => b.lastModified - a.lastModified);
    return Response.json(teams);
  }

  // Team config（含路徑驗證）
  const configMatch = path.match(/^\/api\/teams\/([^/]+)$/);
  if (configMatch) {
    if (!isValidTeamName(configMatch[1])) return new Response("Invalid team name", { status: 400 });
    const config = await readTeamConfig(configMatch[1]);
    return Response.json(config);
  }

  // Team messages（含路徑驗證）
  const msgMatch = path.match(/^\/api\/teams\/([^/]+)\/messages$/);
  if (msgMatch) {
    if (!isValidTeamName(msgMatch[1])) return new Response("Invalid team name", { status: 400 });
    const messages = await readTeamMessages(msgMatch[1]);
    return Response.json(messages);
  }

  // Team tasks（含路徑驗證）
  const taskMatch = path.match(/^\/api\/teams\/([^/]+)\/tasks$/);
  if (taskMatch) {
    if (!isValidTeamName(taskMatch[1])) return new Response("Invalid team name", { status: 400 });
    const tasks = await readTeamTasks(taskMatch[1]);
    return Response.json(tasks);
  }

  // Dashboard HTML
  if (path === "/" || path === "/index.html") {
    return new Response(getDashboardHTML(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response("Not Found", { status: 404 });
}

// ─── WebSocket 管理 ────────────────────────────────────────────────────────

const wsClients = new Set<{ send: (data: string) => void; readyState: number }>();

function broadcast(message: object) {
  const data = JSON.stringify(message);
  for (const client of wsClients) {
    if (client.readyState === 1) {
      try {
        client.send(data);
      } catch {
        wsClients.delete(client);
      }
    }
  }
}

// ─── 檔案監控（含 debounce 防事件風暴）──────────────────────────────────────

const pendingTeams = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(teamName: string) {
  pendingTeams.add(teamName);
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    for (const t of pendingTeams) {
      broadcast({ type: "refresh", team: t });
    }
    pendingTeams.clear();
    debounceTimer = null;
  }, 300);
}

async function watchDir(baseDir: string) {
  if (!existsSync(baseDir)) return;
  try {
    const watcher = watch(baseDir, { recursive: true });
    for await (const event of watcher) {
      const filename = event.filename || "";
      const teamName = filename.split("/")[0] || "*";
      scheduleRefresh(teamName);
    }
  } catch (err) {
    console.error(`[watch] ${baseDir} error:`, err);
  }
}

function startFileWatcher() {
  watchDir(TEAMS_DIR);
  watchDir(TASKS_DIR);
}

// ─── 主服務器 ──────────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    // WebSocket upgrade
    if (req.headers.get("upgrade") === "websocket") {
      const success = server.upgrade(req);
      if (success) return undefined as unknown as Response;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }
    return handleRequest(req);
  },
  websocket: {
    open(ws) {
      wsClients.add(ws);
      console.log(`[ws] client connected (total: ${wsClients.size})`);
    },
    close(ws) {
      wsClients.delete(ws);
      console.log(`[ws] client disconnected (total: ${wsClients.size})`);
    },
    message(ws, data) {
      // read-only dashboard，不處理 client 訊息
    },
  },
});

console.log(`\n🤖 Agent Teams Monitor`);
console.log(`   Dashboard: http://localhost:${PORT}`);
console.log(`   Watching:  ${TEAMS_DIR}`);
console.log(`              ${TASKS_DIR}`);
console.log(`\nPress Ctrl+C to stop\n`);

// 啟動 file watcher（背景執行）
startFileWatcher();

// macOS 自動開啟瀏覽器
if (process.platform === "darwin") {
  const { spawn } = await import("child_process");
  // 稍等一下確保 server 已啟動
  setTimeout(() => {
    spawn("open", [`http://localhost:${PORT}`], { detached: true });
  }, 500);
}
