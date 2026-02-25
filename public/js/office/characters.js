// 角色狀態機 + 動畫控制器
// 管理像素辦公室中的角色 Entity（狀態、動畫幀、移動、繪製）
// 依賴：Renderer, CharacterSprites, GameLoop, Pathfinding, OfficeLayout
const OfficeCharacters = (() => {
  const characters = [];

  const STATES = {
    IDLE: 'idle',
    WORKING: 'working',     // 打字動畫
    READING: 'reading',
    SLEEPING: 'sleeping',
    GONE: 'gone',           // 角色不繪製
    COFFEE: 'coffee',       // 走向咖啡機
    CHATTING: 'chatting',
    CELEBRATE: 'celebrate',
    WALKING: 'walking',
    FIDGET: 'fidget',
  };

  // 動畫幀間隔（毫秒）
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

  // 狀態 → sprite 動畫名稱對應
  function getAnimationName(state) {
    switch (state) {
      case STATES.WORKING:   return 'type';
      case STATES.READING:   return 'read';
      case STATES.SLEEPING:  return 'sleep';
      case STATES.WALKING:
      case STATES.COFFEE:    return 'walk';
      case STATES.CELEBRATE: return 'celebrate';
      case STATES.CHATTING:  return 'type';   // 重用打字動畫
      case STATES.FIDGET:    return 'walk';   // 重用走路動畫
      default:               return 'walk';   // IDLE 使用 walk frame 0（站立）
    }
  }

  // 關鍵：幀索引 → sprite 名稱後綴映射
  // CharacterSprites.getSprite() 中當 frame 為 undefined 時，
  // 直接以 animation 參數作為查詢 key（不做拼接），
  // 因此我們傳入完整 key 如 'walk_stand' 加 undefined frame
  const FRAME_SUFFIX_MAP = {
    walk:      ['stand', 'step'],
    type:      ['1', '2'],
    read:      ['1', '2'],
    sleep:     ['1', '2'],
    celebrate: ['1', '2', '3'],
  };

  function getFrameSuffix(animation, frameIndex) {
    const suffixes = FRAME_SUFFIX_MAP[animation];
    if (!suffixes) return 'stand';
    return suffixes[frameIndex % suffixes.length];
  }

  function getMaxFrames(animation) {
    const suffixes = FRAME_SUFFIX_MAP[animation];
    return suffixes ? suffixes.length : 2;
  }

  // 從 agent 名稱萃取顯示標籤
  function getPersona(name) {
    const label = name
      .replace(/^(agent-|bot-)/, '')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return { label: label.length > 10 ? label.slice(0, 8) + '..' : label };
  }

  const TS = Renderer.TILE_SIZE * Renderer.SCALE; // 48px 每 tile

  // 狀態名稱 → OfficeCharacters.STATES 對應（server → client）
  const SERVER_STATE_MAP = {
    'typing':   STATES.WORKING,
    'reading':  STATES.READING,
    'sleeping': STATES.SLEEPING,
    'gone':     STATES.GONE,
    'coffee':   STATES.COFFEE,
    'idle':     STATES.IDLE,
  };

  // 根據目標 tile 計算朝向
  function directionTo(fromCol, fromRow, toCol, toRow) {
    if (toCol > fromCol) return 'right';
    if (toCol < fromCol) return 'left';
    if (toRow > fromRow) return 'down';
    return 'up';
  }

  // 建立單一角色 Entity
  function createCharacter(member, index, layout) {
    const desk = layout.desks[index];
    if (!desk) return null;
    const persona = getPersona(member.name);

    return {
      name: member.name,
      persona,
      paletteIndex: index,
      state: STATES.IDLE,
      direction: 'down',
      // 像素位置
      x: desk.chairCol * TS,
      y: desk.chairRow * TS,
      tileCol: desk.chairCol,
      tileRow: desk.chairRow,
      // 座位（家位置）
      seatCol: desk.chairCol,
      seatRow: desk.chairRow,
      deskCol: desk.col,
      deskRow: desk.row,
      // 動畫
      frame: 0,
      frameTimer: 0,
      // 行走路徑
      path: [],
      moveProgress: 0,
      // 閒置行為計時器
      wanderTimer: Math.random() * 30000,
      // 內部狀態追蹤
      _previousState: null,
      _targetState: null,
      // 任務/訊息資訊（UI 用）
      task: null,
      lastMsg: null,

      // z-Y 深度排序（角色 sprite 底部）
      get zY() { return this.y + 24 * Renderer.SCALE; },

      update(delta) {
        this.frameTimer += delta;
        const anim = getAnimationName(this.state);
        const dur = FRAME_DURATIONS[this.state] || 1000;
        if (this.frameTimer >= dur) {
          this.frameTimer = 0;
          this.advanceFrame(anim);
        }
        if (this.state === STATES.WALKING || this.state === STATES.COFFEE) {
          this.updateMovement(delta);
        }
        if (this.state === STATES.IDLE || this.state === STATES.SLEEPING) {
          this.updateIdleBehavior(delta);
        }
      },

      advanceFrame(anim) {
        const maxFrames = getMaxFrames(anim);
        this.frame = (this.frame + 1) % maxFrames;
        // 單次動畫（celebrate, fidget）播完回到前一狀態
        if ((this.state === STATES.CELEBRATE || this.state === STATES.FIDGET) && this.frame === 0) {
          this.state = this._previousState || STATES.IDLE;
        }
      },

      updateMovement(delta) {
        if (this.path.length === 0) {
          this.state = this._targetState || STATES.IDLE;
          this.frame = 0;
          return;
        }
        this.moveProgress += delta / 300; // 每 tile 300ms
        if (this.moveProgress >= 1) {
          const next = this.path.shift();
          this.tileCol = next.col;
          this.tileRow = next.row;
          this.x = next.col * TS;
          this.y = next.row * TS;
          this.moveProgress = 0;
          // 根據下一個路點更新朝向
          if (this.path.length > 0) {
            const n = this.path[0];
            this.direction = directionTo(this.tileCol, this.tileRow, n.col, n.row);
          }
        } else if (this.path.length > 0) {
          // 在 tile 之間插值位置
          const next = this.path[0];
          const fromX = this.tileCol * TS;
          const fromY = this.tileRow * TS;
          this.x = fromX + (next.col * TS - fromX) * this.moveProgress;
          this.y = fromY + (next.row * TS - fromY) * this.moveProgress;
        }
      },

      updateIdleBehavior(delta) {
        this.wanderTimer -= delta;
        if (this.wanderTimer <= 0) {
          this._previousState = this.state;
          this.state = STATES.FIDGET;
          this.frame = 0;
          this.frameTimer = 0;
          this.wanderTimer = 20000 + Math.random() * 40000; // 20~60 秒
        }
      },

      walkTo(col, row, targetState) {
        const grid = OfficeLayout._currentGrid;
        if (!grid) return;
        const path = Pathfinding.findPath(grid, this.tileCol, this.tileRow, col, row);
        if (path.length > 0) {
          this.path = path;
          this.state = STATES.WALKING;
          this._targetState = targetState || STATES.IDLE;
          this.moveProgress = 0;
          this.frame = 0;
          this.direction = directionTo(this.tileCol, this.tileRow, path[0].col, path[0].row);
        }
      },

      goToCoffee(layout) {
        const cmRow = layout.coffeeMachine.row - 1; // 從上方接近
        this.walkTo(layout.coffeeMachine.col, cmRow, STATES.IDLE);
      },

      returnToSeat() {
        this.walkTo(this.seatCol, this.seatRow, this._targetState || STATES.IDLE);
      },

      draw(ctx) {
        if (this.state === STATES.GONE) return;
        const anim = getAnimationName(this.state);
        const suffix = getFrameSuffix(anim, this.frame);
        // IDLE 狀態固定顯示 frame 0（站立姿勢）
        const actualSuffix = this.state === STATES.IDLE ? 'stand' : suffix;
        // 傳入完整 key 如 'walk_stand'，frame 為 undefined 以跳過拼接邏輯
        const sprite = CharacterSprites.getSprite(
          this.direction, anim + '_' + actualSuffix, undefined, this.paletteIndex
        );
        if (sprite) {
          Renderer.drawSprite(ctx, sprite, this.x, this.y);
        }
        // 名稱標籤
        drawNameLabel(ctx, this);
      },

      setState(serverState) {
        const newState = SERVER_STATE_MAP[serverState] || STATES.IDLE;
        if (this.state !== newState && this.state !== STATES.WALKING) {
          // 不中斷行走狀態
          this.state = newState;
          this.frame = 0;
          this.frameTimer = 0;
        }
      },
    };
  }

  // 繪製角色名稱標籤（暗底白字）
  function drawNameLabel(ctx, char) {
    const labelText = char.persona.label || char.name;
    const centerX = char.x + 8 * Renderer.SCALE;
    const labelY = char.y - 6;

    ctx.save();
    ctx.font = '10px "Fira Code", monospace';
    const metrics = ctx.measureText(labelText);
    const padding = 3;
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      centerX - metrics.width / 2 - padding,
      labelY - 10,
      metrics.width + padding * 2,
      14
    );
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, centerX, labelY - 3);
    ctx.restore();
  }

  // 初始化所有角色（從團隊資料）
  function init(members, statusList, layout) {
    // 移除舊角色 Entity
    for (const char of characters) {
      GameLoop.removeEntity(char);
    }
    characters.length = 0;

    members.forEach((m, i) => {
      if (i >= layout.desks.length) return; // 超出桌位數的成員忽略
      const char = createCharacter(m, i, layout);
      if (!char) return;
      // 套用伺服器狀態（若有）
      if (statusList) {
        const status = statusList.find(s => s.agent === m.name);
        if (status) char.setState(status.state);
      }
      characters.push(char);
      GameLoop.addEntity(char);
    });
  }

  function getByName(name) {
    return characters.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  return { init, getByName, characters, STATES };
})();
