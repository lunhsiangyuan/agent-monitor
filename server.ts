#!/usr/bin/env bun
/**
 * Agent Teams Monitor Dashboard
 * 即時監控所有 Claude Code Agent Teams 的訊息與任務狀態
 * 啟動：bun run ~/.claude/tools/agent-monitor/server.ts
 */

import { readdir, readFile, watch, stat } from "fs/promises";
import { existsSync, statSync } from "fs";
import { join } from "path";

const TEAMS_DIR = join(process.env.HOME!, ".claude/teams");
const TASKS_DIR = join(process.env.HOME!, ".claude/tasks");
const PORT = parseInt(process.env.PORT || '3333');

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

interface AgentStatus {
  agent: string;
  state: 'typing' | 'reading' | 'sleeping' | 'gone' | 'coffee' | 'idle';
  task?: string;
  lastMsg?: string;
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

  const allMessages: InboxMessage[] = [];

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

// ─── Agent 狀態推斷 ─────────────────────────────────────────────────────────

function formatAge(ms: number): string {
  if (ms < 60000) return '<1min';
  if (ms < 3600000) return Math.floor(ms / 60000) + 'min';
  return Math.floor(ms / 3600000) + 'h';
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

    // 優先順序狀態推斷：
    // 1. 檢查 shutdown / idle_notification
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

    // 2. 有 in_progress 任務
    const inProgress = agentTasks.find(t => t.status === 'in_progress');
    if (inProgress) {
      if (lastMsgAge < 120000) { // 最近訊息 < 2 分鐘 → 正在輸出
        return { agent: name, state: 'typing' as const, task: inProgress.subject, lastMsg: formatAge(lastMsgAge) };
      }
      // 有任務但安靜 → 閱讀/思考中
      return { agent: name, state: 'reading' as const, task: inProgress.subject, lastMsg: formatAge(lastMsgAge) };
    }

    // 3. 有被阻塞的任務 → 等待中（coffee break）
    const blocked = agentTasks.find(t => t.status === 'pending' && t.blockedBy?.length > 0);
    if (blocked) {
      return { agent: name, state: 'coffee' as const, task: blocked.subject };
    }

    // 4. 預設 idle
    return { agent: name, state: 'idle' as const, lastMsg: lastMsg ? formatAge(lastMsgAge) : undefined };
  });
}

// ─── 靜態檔案目錄 ──────────────────────────────────────────────────────────
const PUBLIC_DIR = join(import.meta.dir, "public");

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

  // Team 相關 API（統一路徑驗證）
  const teamMatch = path.match(/^\/api\/teams\/([^/]+)(\/[a-z]*)?$/);
  if (teamMatch) {
    const teamName = teamMatch[1];
    const sub = teamMatch[2] || '';
    if (!isValidTeamName(teamName)) return new Response("Invalid team name", { status: 400 });

    switch (sub) {
      case '':          return Response.json(await readTeamConfig(teamName));
      case '/messages':  return Response.json(await readTeamMessages(teamName));
      case '/tasks':     return Response.json(await readTeamTasks(teamName));
      case '/status':    return Response.json(await inferAgentStatus(teamName));
      default:           return new Response("Not Found", { status: 404 });
    }
  }

  // Dashboard HTML
  if (path === "/" || path === "/index.html") {
    const html = await readFile(join(PUBLIC_DIR, "index.html"), "utf-8");
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // 靜態檔案（CSS、JS 等）— 使用 Bun.file() 提供
  const filePath = join(PUBLIC_DIR, path);
  if (!filePath.startsWith(PUBLIC_DIR)) return new Response("Forbidden", { status: 403 });
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const file = Bun.file(filePath);
    return new Response(file);
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
  debounceTimer = setTimeout(async () => {
    for (const t of pendingTeams) {
      // 嘗試從最新訊息提取事件細節
      try {
        const messages = await readTeamMessages(t);
        const lastMsg = messages[messages.length - 1];
        if (lastMsg) {
          broadcast({
            type: 'event',
            team: t,
            event: 'message',
            from: lastMsg.from,
            to: lastMsg.to,
            summary: lastMsg.summary || lastMsg.text.slice(0, 50),
            timestamp: lastMsg.timestamp,
          });
        }
      } catch {}
      // 永遠發送 refresh 以同步資料
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
  setTimeout(() => Bun.spawn(["open", `http://localhost:${PORT}`]), 500);
}
