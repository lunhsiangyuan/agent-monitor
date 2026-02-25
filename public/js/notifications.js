// notifications.js - Toast 通知 + Agent Info Card
// 依賴：OfficeCharacters, Renderer（用於 canvas 點擊偵測）

const Notifications = (() => {
  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(text, icon) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = (icon || '\u26A1') + ' ' + text;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function showAgentCard(char, screenX, screenY) {
    // 移除舊的 card
    document.querySelectorAll('.agent-card').forEach(c => c.remove());
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.style.left = screenX + 'px';
    card.style.top = screenY + 'px';

    const stateText = stateEmoji(char.state) + ' ' + char.state;
    const taskRow = char.task ? '<div class="agent-card-row">Task: ' + escHtml(char.task) + '</div>' : '';
    const msgRow = char.lastMsg ? '<div class="agent-card-row">Last msg: ' + char.lastMsg + '</div>' : '';

    card.innerHTML =
      '<div class="agent-card-name">\uD83E\uDD16 ' + escHtml(char.persona.label || char.name) + '</div>' +
      '<div class="agent-card-row">Status: ' + stateText + '</div>' +
      taskRow +
      msgRow +
      '<button class="agent-card-btn" onclick="switchView(\'chat\')">View Chat \u25B8</button>';

    card.style.pointerEvents = 'auto';
    document.getElementById('officeOverlay').appendChild(card);

    // 點擊外部時關閉 card
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
    const map = {
      working: '\uD83D\uDCBB', reading: '\uD83D\uDCD6', sleeping: '\uD83D\uDCA4',
      gone: '\uD83D\uDEAA', coffee: '\u2615', idle: '\uD83E\uDDD8',
      chatting: '\uD83D\uDCAC', celebrate: '\uD83C\uDF89'
    };
    return map[state] || '\u2753';
  }

  return { showToast, showAgentCard, escHtml };
})();
