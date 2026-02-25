// 地板與牆壁 tile sprite 資料 — 16×16 hex[][]
// 使用灰度設計，透過 Renderer.colorize() 上色以區分不同團隊區域
const FloorSprites = (() => {
  const _ = '';

  // 基礎地板 tile：16×16
  // 微妙的 8×8 棋盤格，兩種灰度交替
  // 淺色 A = #999999, 深色 B = #888888, 接縫 = #7A7A7A
  const A = '#999999';
  const B = '#888888';
  const S = '#7A7A7A'; // 接縫線

  const BASE_TILE = [
    [S, A, A, A, A, A, A, A, S, B, B, B, B, B, B, B],  // 0
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 1
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 2
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 3
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 4
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 5
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 6
    [A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, B],  // 7
    [S, B, B, B, B, B, B, B, S, A, A, A, A, A, A, A],  // 8
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 9
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 10
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 11
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 12
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 13
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 14
    [B, B, B, B, B, B, B, B, A, A, A, A, A, A, A, A],  // 15
  ];

  // 牆壁 tile：16×16
  // 深色面板效果，水平線暗示牆面板
  const WA = '#555555'; // 牆面主色
  const WB2 = '#444444'; // 牆面暗色
  const WL = '#4A4A4A'; // 面板線
  const WD = '#3A3A3A'; // 深色接縫

  const WALL_TILE = [
    [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD],  // 0 頂部接縫
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 1 面板
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 2
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 3
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 4
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 5
    [WD, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WD],  // 6
    [WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL],  // 7 中間水平線
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 8 下半面板
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 9
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 10
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 11
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 12
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 13
    [WD, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WB2, WD],  // 14
    [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD],  // 15 底部接縫
  ];

  // 取得彩色地板 tile（按團隊色相上色）
  function getFloorTile(hue, saturation) {
    return Renderer.colorize(BASE_TILE, hue || 220, saturation || 15, 1.1, -10);
  }

  // 取得彩色牆壁 tile
  function getWallTile(hue) {
    return Renderer.colorize(WALL_TILE, hue || 220, 10, 1.0, -20);
  }

  return { BASE_TILE, WALL_TILE, getFloorTile, getWallTile };
})();
