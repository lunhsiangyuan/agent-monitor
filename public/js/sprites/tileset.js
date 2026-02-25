// tileset.js — donarg Office Tileset (32×32px) 座標定義
// 購買來源: https://donarg.itch.io/officetileset
// 圖片: /images/office-tileset.png (512×1024 RGBA, 16×32 grid)

const TilesetSprites = (() => {
  const GT = 48; // Game Tile = TILE_SIZE(16) × SCALE(3) = 48px

  // 自動預載圖片（無需 Promise）
  const _img = new Image();
  _img.src = '/images/office-tileset.png';

  function getImage() { return _img; }

  // 每個 sprite: { sx, sy, sw, sh } = tileset 來源座標
  //              { dw, dh }         = 遊戲顯示尺寸 (px)
  //              { heightTiles }    = 物件高度 (game tiles，用於 zY 排序)
  const sprites = {
    // ── 辦公桌（2×2 game tiles）────────────────────────────
    DESK: { sx: 32, sy: 0, sw: 64, sh: 64, dw: GT*2, dh: GT*2, heightTiles: 2 },

    // ── 椅子 — 4 方向（1×1 game tile）─────────────────────
    CHAIR_DOWN:  { sx: 0,  sy: 384, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },
    CHAIR_UP:    { sx: 64, sy: 384, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },
    CHAIR_LEFT:  { sx: 0,  sy: 416, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },
    CHAIR_RIGHT: { sx: 64, sy: 416, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },

    // ── 電腦螢幕（1×1 game tile）────────────────────────────
    PC: { sx: 288, sy: 768, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },

    // ── 書架（1×2 game tiles，直式）────────────────────────
    BOOKSHELF: { sx: 256, sy: 384, sw: 32, sh: 64, dw: GT, dh: GT*2, heightTiles: 2 },

    // ── 植物（1×1 game tile）────────────────────────────────
    PLANT: { sx: 128, sy: 896, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },

    // ── 咖啡機 / 飲水機（1×2 game tiles）──────────────────
    COFFEE_MACHINE: { sx: 256, sy: 512, sw: 32, sh: 64, dw: GT, dh: GT*2, heightTiles: 2 },

    // ── 白板（2×1 game tiles，橫式）────────────────────────
    WHITEBOARD: { sx: 0, sy: 832, sw: 64, sh: 32, dw: GT*2, dh: GT, heightTiles: 1 },

    // ── 時鐘（1×1 game tile）────────────────────────────────
    CLOCK: { sx: 0, sy: 704, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },

    // ── 地板 tile（1×1 game tile，可鋪滿）──────────────────
    FLOOR_TILE: { sx: 0, sy: 960, sw: 32, sh: 32, dw: GT, dh: GT, heightTiles: 1 },
  };

  return { ...sprites, getImage };
})();
