// 視覺特效系統 — 信封飛行、頭上泡泡、慶祝粒子、Zzz 睡眠、紅閃
// 所有特效透過單一 effectsEntity 管理，zY 最高以確保繪製在最上層
// 依賴：Renderer, GameLoop, OfficeCharacters
const OfficeEffects = (() => {
  const effects = [];

  // ── 信封飛行 ──────────────────────────────────────────────────────────────
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
      duration: 1000,
      zY: 9999,
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) {
          this.done = true;
          spawnBubble(toChar, '\u{1F4A1}', 1500); // 到達後接收者顯示 💡
          return;
        }
        const t = this.progress;
        this.x = this.startX + (this.endX - this.startX) * t;
        this.y = this.startY + (this.endY - this.startY) * t - Math.sin(t * Math.PI) * 60;
      },
      draw(ctx) {
        ctx.font = (12 * Renderer.SCALE / 3) + 'px serif';
        ctx.fillText('\u2709\uFE0F', this.x, this.y); // ✉️
      },
    });
    spawnBubble(fromChar, '\u2709\uFE0F', 800); // 發送者顯示 ✉️
  }

  // ── 頭上泡泡 ──────────────────────────────────────────────────────────────
  function spawnBubble(char, emoji, duration) {
    effects.push({
      type: 'bubble',
      emoji,
      char,
      x: char.x + 8 * Renderer.SCALE,
      y: char.y - 10,
      startY: char.y - 10,
      progress: 0,
      duration: duration || 2000,
      zY: 9999,
      update(delta) {
        this.progress += delta / this.duration;
        if (this.progress >= 1) { this.done = true; return; }
        this.y = this.startY - this.progress * 20;
        this.x = this.char.x + 8 * Renderer.SCALE; // 跟隨角色水平位置
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

  // ── 星星粒子（任務完成慶祝）────────────────────────────────────────────────
  function spawnCelebration(char) {
    const cx = char.x + 8 * Renderer.SCALE;
    const cy = char.y;
    const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784'];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 40 + Math.random() * 30;
      effects.push({
        type: 'star',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 1,
        color: colors[i % 4],
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
          ctx.fillStyle = this.color;
          const s = 3 * this.life;
          ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
          ctx.globalAlpha = 1;
        },
      });
    }
  }

  // ── Zzz 粒子（睡眠）──────────────────────────────────────────────────────
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
          // 若角色仍在睡覺，500ms 後自動重新生成
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

  // ── 全場紅閃（Shutdown 警報）──────────────────────────────────────────────
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
          const { w, h } = GameLoop.getSize();
          ctx.fillRect(0, 0, w, h);
        }
      },
    });
  }

  // ── GameLoop 整合 — 單一 Entity 管理所有特效 ────────────────────────────────
  const effectsEntity = {
    zY: 99999,
    update(delta) {
      for (const e of effects) e.update(delta);
      // 移除已完成的特效
      for (let i = effects.length - 1; i >= 0; i--) {
        if (effects[i].done) effects.splice(i, 1);
      }
    },
    draw(ctx) {
      for (const e of effects) e.draw(ctx);
    },
  };

  function register() {
    GameLoop.addEntity(effectsEntity);
  }

  return { sendEnvelope, spawnBubble, spawnCelebration, spawnZzz, flashRed, register };
})();
