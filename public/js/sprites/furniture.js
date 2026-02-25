// 家具 sprite 資料 — hex[][] 格式
// 各物件尺寸：DESK 32×32, CHAIR 16×16, PC 16×16,
// BOOKSHELF 16×32, PLANT 16×24, COFFEE_MACHINE 16×24,
// WHITEBOARD 32×16, WINDOW 32×32, CLOCK 16×16
const FurnitureSprites = (() => {
  const _ = '';

  // 木質色系
  const W1 = '#A67C00'; // 木質亮面
  const W2 = '#8B6914'; // 木質中間
  const W3 = '#6B4E12'; // 木質暗面
  const W4 = '#5A3E0A'; // 木質深暗

  // ========================================
  // 桌子：32×32（2×2 tiles），俯視角度
  // ========================================
  const DESK = [
    //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
    [_, _, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, _, _],  // 0
    [_, W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3, _],  // 1
    [W3, W4, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W4, W3],  // 2
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 3
    [W3, W4, W2, W1, W1, W1, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W1, W1, W1, W2, W4, W3],  // 4
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 5
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 6
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 7
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 8
    [W3, W4, W2, W1, W1, W1, W1, W1, W2, W1, W1, W1, W1, W1, W2, W1, W1, W2, W1, W1, W1, W1, W1, W2, W1, W1, W1, W1, W1, W2, W4, W3],  // 9
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 10
    [W3, W4, W2, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W1, W2, W4, W3],  // 11
    [W3, W4, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W2, W4, W3],  // 12
    [W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3],  // 13
    [_, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, _],  // 14
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 15 桌腳
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 16
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 17
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 18
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 19
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 20
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 21
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 22
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 23
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 24
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 25
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 26
    [_, _, W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3, _, _],  // 27
    [_, _, W4, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W4, _, _],  // 28
    [_, _, W4, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W4, _, _],  // 29
    [_, _, W4, W4, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W4, W4, _, _],  // 30
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 31
  ];

  // ========================================
  // 椅子：16×16，面向下（觀眾方向）
  // ========================================
  const CB = '#8B6914'; // 椅子主色
  const CD = '#6B4E12'; // 椅子暗色
  const CL = '#A67C00'; // 椅子亮色
  const CS = '#5A3E0A'; // 椅子座面暗

  const CHAIR_DOWN = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 1
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 2 椅背柱
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 3
    [_, _, CD, CB, CB, CB, CB, CB, CB, CB, CB, CB, CB, CD, _, _],  // 4 椅背
    [_, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _],  // 5
    [_, _, CD, CB, CB, CB, CB, CB, CB, CB, CB, CB, CB, CD, _, _],  // 6
    [_, _, _, CD, CD, CD, CD, CD, CD, CD, CD, CD, CD, _, _, _],  // 7
    [_, _, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _, _],  // 8 座面
    [_, _, _, CD, CL, CB, CB, CB, CB, CB, CB, CL, CD, _, _, _],  // 9
    [_, _, _, CD, CL, CB, CB, CB, CB, CB, CB, CL, CD, _, _, _],  // 10
    [_, _, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _, _],  // 11
    [_, _, _, CD, CS, CS, CS, CS, CS, CS, CS, CS, CD, _, _, _],  // 12 座面前緣
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 13 椅腳
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 14
    [_, _, CD, CD, _, _, _, _, _, _, _, _, CD, CD, _, _],  // 15
  ];

  // 椅子面向上（背對觀眾）
  const CHAIR_UP = [
    [_, _, CD, CD, _, _, _, _, _, _, _, _, CD, CD, _, _],  // 0 椅腳頂
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 1
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 2
    [_, _, _, CD, CS, CS, CS, CS, CS, CS, CS, CS, CD, _, _, _],  // 3 座面
    [_, _, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _, _],  // 4
    [_, _, _, CD, CL, CB, CB, CB, CB, CB, CB, CL, CD, _, _, _],  // 5
    [_, _, _, CD, CL, CB, CB, CB, CB, CB, CB, CL, CD, _, _, _],  // 6
    [_, _, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _, _],  // 7
    [_, _, _, CD, CD, CD, CD, CD, CD, CD, CD, CD, CD, _, _, _],  // 8
    [_, _, CD, CB, CB, CB, CB, CB, CB, CB, CB, CB, CB, CD, _, _],  // 9 椅背
    [_, _, CD, CL, CL, CL, CL, CL, CL, CL, CL, CL, CL, CD, _, _],  // 10
    [_, _, CD, CB, CB, CB, CB, CB, CB, CB, CB, CB, CB, CD, _, _],  // 11
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 12 椅背柱
    [_, _, _, CD, _, _, _, _, _, _, _, _, CD, _, _, _],  // 13
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 14
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 15
  ];

  // 椅子面向右
  const CHAIR_RIGHT = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, _, _, _, _, _, _, _, _, CD, _, _, _, _, _],  // 1 椅背柱
    [_, _, _, _, _, _, _, _, _, _, CD, _, _, _, _, _],  // 2
    [_, _, _, _, _, _, _, CD, CB, CL, CB, CD, _, _, _, _],  // 3 椅背
    [_, _, _, _, _, _, _, CD, CB, CL, CB, CD, _, _, _, _],  // 4
    [_, _, _, _, _, _, _, CD, CB, CL, CB, CD, _, _, _, _],  // 5
    [_, _, _, _, _, _, _, CD, CD, CD, CD, CD, _, _, _, _],  // 6
    [_, _, _, _, _, CD, CL, CL, CB, CB, CL, CD, _, _, _, _],  // 7 座面
    [_, _, _, _, _, CD, CL, CB, CB, CB, CL, CD, _, _, _, _],  // 8
    [_, _, _, _, _, CD, CL, CB, CB, CB, CL, CD, _, _, _, _],  // 9
    [_, _, _, _, _, CD, CL, CL, CB, CB, CL, CD, _, _, _, _],  // 10
    [_, _, _, _, _, CD, CS, CS, CS, CS, CS, CD, _, _, _, _],  // 11
    [_, _, _, _, _, CD, _, _, _, _, _, CD, _, _, _, _],  // 12 椅腳
    [_, _, _, _, _, CD, _, _, _, _, _, CD, _, _, _, _],  // 13
    [_, _, _, _, CD, CD, _, _, _, _, CD, CD, _, _, _, _],  // 14
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 15
  ];

  // 椅子面向左 = 鏡像翻轉 RIGHT
  const CHAIR_LEFT = Renderer.flipHorizontal(CHAIR_RIGHT);

  // ========================================
  // 電腦螢幕：16×16
  // ========================================
  const GF = '#666666'; // 外框灰
  const GD = '#444444'; // 深灰
  const GL = '#888888'; // 亮灰
  const SC = '#3399FF'; // 螢幕藍
  const SG = '#2277DD'; // 螢幕深藍
  const SW = '#66BBFF'; // 螢幕亮

  const PC = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, _, GD, GD, GD, GD, GD, GD, GD, GD, GD, GD, _, _, _],  // 1 外框頂
    [_, _, GD, GF, GF, GF, GF, GF, GF, GF, GF, GF, GF, GD, _, _],  // 2
    [_, _, GD, SC, SC, SC, SC, SC, SC, SC, SC, SC, SC, GD, _, _],  // 3 螢幕
    [_, _, GD, SC, SW, SW, SC, SC, SC, SC, SW, SW, SC, GD, _, _],  // 4 螢幕上反光
    [_, _, GD, SC, SC, SC, SC, SC, SC, SC, SC, SC, SC, GD, _, _],  // 5
    [_, _, GD, SC, SC, SG, SG, SG, SG, SG, SG, SC, SC, GD, _, _],  // 6 螢幕文字行
    [_, _, GD, SC, SC, SC, SC, SC, SC, SC, SC, SC, SC, GD, _, _],  // 7
    [_, _, GD, SC, SC, SG, SG, SG, SG, SC, SC, SC, SC, GD, _, _],  // 8 螢幕文字行
    [_, _, GD, SC, SC, SC, SC, SC, SC, SC, SC, SC, SC, GD, _, _],  // 9
    [_, _, GD, GF, GF, GF, GF, GF, GF, GF, GF, GF, GF, GD, _, _],  // 10 外框底
    [_, _, _, GD, GD, GD, GD, GD, GD, GD, GD, GD, GD, _, _, _],  // 11
    [_, _, _, _, _, _, GD, GD, GD, GD, _, _, _, _, _, _],  // 12 支架
    [_, _, _, _, _, _, GD, GL, GL, GD, _, _, _, _, _, _],  // 13 支架
    [_, _, _, _, _, GD, GD, GD, GD, GD, GD, _, _, _, _, _],  // 14 底座
    [_, _, _, _, _, GD, GL, GL, GL, GL, GD, _, _, _, _, _],  // 15 底座
  ];

  // ========================================
  // 書架：16 寬 × 32 高（靠牆放置）
  // ========================================
  const BK1 = '#CC3333'; // 紅色書脊
  const BK2 = '#3366AA'; // 藍色書脊
  const BK3 = '#33AA55'; // 綠色書脊
  const BK4 = '#CC9933'; // 黃色書脊
  const BK5 = '#996633'; // 棕色書脊
  const BK6 = '#9944AA'; // 紫色書脊
  const SF = '#777777'; // 架板色

  const BOOKSHELF = [
    [_, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, _],  // 0  頂板
    [W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3],  // 1
    [W3, W4, BK1, BK1, BK2, BK2, BK3, BK4, BK4, BK5, BK6, BK6, BK2, BK1, W4, W3],  // 2  第一層書
    [W3, W4, BK1, BK1, BK2, BK2, BK3, BK4, BK4, BK5, BK6, BK6, BK2, BK1, W4, W3],  // 3
    [W3, W4, BK1, BK1, BK2, BK2, BK3, BK4, BK4, BK5, BK6, BK6, BK2, BK1, W4, W3],  // 4
    [W3, W4, BK1, BK1, BK2, BK2, BK3, BK4, BK4, BK5, BK6, BK6, BK2, BK1, W4, W3],  // 5
    [W3, W4, BK1, BK1, BK2, BK2, BK3, BK4, BK4, BK5, BK6, BK6, BK2, BK1, W4, W3],  // 6
    [W3, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, W3],  // 7  隔板
    [W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3],  // 8
    [W3, W4, BK3, BK5, BK5, BK1, BK1, BK4, BK6, BK6, BK2, BK2, BK4, BK3, W4, W3],  // 9  第二層書
    [W3, W4, BK3, BK5, BK5, BK1, BK1, BK4, BK6, BK6, BK2, BK2, BK4, BK3, W4, W3],  // 10
    [W3, W4, BK3, BK5, BK5, BK1, BK1, BK4, BK6, BK6, BK2, BK2, BK4, BK3, W4, W3],  // 11
    [W3, W4, BK3, BK5, BK5, BK1, BK1, BK4, BK6, BK6, BK2, BK2, BK4, BK3, W4, W3],  // 12
    [W3, W4, BK3, BK5, BK5, BK1, BK1, BK4, BK6, BK6, BK2, BK2, BK4, BK3, W4, W3],  // 13
    [W3, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, W3],  // 14 隔板
    [W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3],  // 15
    [W3, W4, BK4, BK2, BK6, BK6, BK3, BK3, BK1, BK5, BK5, BK4, BK2, BK1, W4, W3],  // 16 第三層書
    [W3, W4, BK4, BK2, BK6, BK6, BK3, BK3, BK1, BK5, BK5, BK4, BK2, BK1, W4, W3],  // 17
    [W3, W4, BK4, BK2, BK6, BK6, BK3, BK3, BK1, BK5, BK5, BK4, BK2, BK1, W4, W3],  // 18
    [W3, W4, BK4, BK2, BK6, BK6, BK3, BK3, BK1, BK5, BK5, BK4, BK2, BK1, W4, W3],  // 19
    [W3, W4, BK4, BK2, BK6, BK6, BK3, BK3, BK1, BK5, BK5, BK4, BK2, BK1, W4, W3],  // 20
    [W3, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, W3],  // 21 隔板
    [W3, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W4, W3],  // 22
    [W3, W4, BK6, BK1, BK1, BK3, BK4, BK2, BK2, BK5, BK3, BK6, BK4, BK5, W4, W3],  // 23 第四層書
    [W3, W4, BK6, BK1, BK1, BK3, BK4, BK2, BK2, BK5, BK3, BK6, BK4, BK5, W4, W3],  // 24
    [W3, W4, BK6, BK1, BK1, BK3, BK4, BK2, BK2, BK5, BK3, BK6, BK4, BK5, W4, W3],  // 25
    [W3, W4, BK6, BK1, BK1, BK3, BK4, BK2, BK2, BK5, BK3, BK6, BK4, BK5, W4, W3],  // 26
    [W3, W4, BK6, BK1, BK1, BK3, BK4, BK2, BK2, BK5, BK3, BK6, BK4, BK5, W4, W3],  // 27
    [W3, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, SF, W3],  // 28 底板
    [W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3, W3],  // 29
    [W3, _, _, _, _, _, _, _, _, _, _, _, _, _, _, W3],  // 30 底腳
    [W4, W4, _, _, _, _, _, _, _, _, _, _, _, _, W4, W4],  // 31
  ];

  // ========================================
  // 盆栽：16 寬 × 24 高
  // ========================================
  const G1 = '#228B22'; // 深綠
  const G2 = '#2E8B57'; // 中綠
  const G3 = '#55CC55'; // 亮綠
  const PT = '#CD853F'; // 赤陶盆
  const PD = '#A0603A'; // 盆暗面
  const DT = '#8B4513'; // 泥土

  const PLANT = [
    [_, _, _, _, _, _, _, G3, G3, _, _, _, _, _, _, _],  // 0  頂部葉子
    [_, _, _, _, _, _, G3, G1, G3, G3, _, _, _, _, _, _],  // 1
    [_, _, _, _, _, G3, G2, G1, G2, G3, G3, _, _, _, _, _],  // 2
    [_, _, _, _, G3, G2, G1, G2, G1, G2, G3, _, _, _, _, _],  // 3
    [_, _, _, G3, G2, G1, G2, G2, G2, G1, G2, G3, _, _, _, _],  // 4
    [_, _, G3, G2, G1, G2, G1, G2, G1, G2, G1, G2, G3, _, _, _],  // 5
    [_, _, G2, G1, G2, G1, G2, G2, G2, G1, G2, G1, G2, _, _, _],  // 6
    [_, G3, G2, G1, G2, G2, G1, G2, G1, G2, G2, G1, G2, G3, _, _],  // 7
    [_, G2, G1, G2, G1, G2, G2, G2, G2, G2, G1, G2, G1, G2, _, _],  // 8
    [_, _, G2, G1, G2, G1, G2, G1, G2, G1, G2, G1, G2, _, _, _],  // 9
    [_, _, _, G2, G1, G2, G2, G2, G2, G2, G1, G2, _, _, _, _],  // 10
    [_, _, _, _, G2, G1, G2, G1, G2, G1, G2, _, _, _, _, _],  // 11
    [_, _, _, _, _, G2, G1, G2, G1, G2, _, _, _, _, _, _],  // 12 莖部
    [_, _, _, _, _, _, G1, G2, G1, _, _, _, _, _, _, _],  // 13
    [_, _, _, _, _, _, _, G1, _, _, _, _, _, _, _, _],  // 14
    [_, _, _, _, _, PT, PT, PT, PT, PT, PT, _, _, _, _, _],  // 15 盆頂
    [_, _, _, _, PT, PT, DT, DT, DT, DT, PT, PT, _, _, _, _],  // 16 盆口+土
    [_, _, _, _, PT, PD, DT, DT, DT, DT, PD, PT, _, _, _, _],  // 17
    [_, _, _, _, PT, PD, PD, PD, PD, PD, PD, PT, _, _, _, _],  // 18 盆身
    [_, _, _, _, _, PT, PD, PD, PD, PD, PT, _, _, _, _, _],  // 19
    [_, _, _, _, _, PT, PD, PD, PD, PD, PT, _, _, _, _, _],  // 20
    [_, _, _, _, _, _, PT, PT, PT, PT, _, _, _, _, _, _],  // 21 盆底
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 22
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 23
  ];

  // ========================================
  // 咖啡機：16 寬 × 24 高
  // ========================================
  const MG = '#333333'; // 機身深灰
  const ML = '#555555'; // 機身淺灰
  const MH = '#777777'; // 機身高亮
  const RL = '#CC2222'; // 紅色指示燈
  const CW = '#EEEEEE'; // 杯子白
  const CF = '#8B4513'; // 咖啡棕

  const COFFEE_MACHINE = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, _, _, MG, MG, MG, MG, MG, MG, MG, MG, _, _, _, _],  // 1  頂部
    [_, _, _, MG, MG, ML, ML, ML, ML, ML, ML, MG, MG, _, _, _],  // 2
    [_, _, _, MG, ML, MH, MH, MH, MH, MH, MH, ML, MG, _, _, _],  // 3  機身上半
    [_, _, _, MG, ML, MH, RL, MH, MH, MH, MH, ML, MG, _, _, _],  // 4  紅燈
    [_, _, _, MG, ML, ML, ML, ML, ML, ML, ML, ML, MG, _, _, _],  // 5
    [_, _, _, MG, MG, MG, MG, MG, MG, MG, MG, MG, MG, _, _, _],  // 6
    [_, _, _, MG, ML, ML, ML, ML, ML, ML, ML, ML, MG, _, _, _],  // 7
    [_, _, _, MG, ML, MG, MG, MG, MG, MG, MG, ML, MG, _, _, _],  // 8
    [_, _, _, MG, ML, MG, _, _, _, _, MG, ML, MG, _, _, _],  // 9  出水口
    [_, _, _, MG, ML, MG, _, _, _, _, MG, ML, MG, _, _, _],  // 10
    [_, _, _, MG, ML, MG, _, CW, CW, _, MG, ML, MG, _, _, _],  // 11 杯子
    [_, _, _, MG, ML, MG, CW, CF, CF, CW, MG, ML, MG, _, _, _],  // 12 杯子+咖啡
    [_, _, _, MG, ML, MG, CW, CF, CF, CW, MG, ML, MG, _, _, _],  // 13
    [_, _, _, MG, ML, MG, CW, CW, CW, CW, MG, ML, MG, _, _, _],  // 14
    [_, _, _, MG, ML, MG, MG, MG, MG, MG, MG, ML, MG, _, _, _],  // 15 底部托盤
    [_, _, _, MG, ML, ML, ML, ML, ML, ML, ML, ML, MG, _, _, _],  // 16
    [_, _, _, MG, MG, MG, MG, MG, MG, MG, MG, MG, MG, _, _, _],  // 17
    [_, _, _, _, MG, ML, ML, ML, ML, ML, ML, MG, _, _, _, _],  // 18 底座
    [_, _, _, _, MG, MG, MG, MG, MG, MG, MG, MG, _, _, _, _],  // 19
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 20
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 21
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 22
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 23
  ];

  // ========================================
  // 白板：32 寬 × 16 高（牆上）
  // ========================================
  const WF = '#AAAAAA'; // 白板框灰
  const WW = '#F0F0F0'; // 白板面
  const WL = '#DDDDDD'; // 白板淺灰
  const WB = '#4488CC'; // 藍色文字
  const WR = '#CC4444'; // 紅色標記

  const WHITEBOARD = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, _, _],  // 1 外框頂
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 2
    [_, WF, WW, WB, WB, WB, WB, WB, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 3 文字
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 4
    [_, WF, WW, WB, WB, WB, WB, WB, WB, WB, WB, WW, WW, WR, WR, WR, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 5
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 6
    [_, WF, WW, WB, WB, WB, WB, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WR, WR, WR, WR, WR, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 7
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 8
    [_, WF, WW, WB, WB, WB, WB, WB, WB, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WR, WR, WW, WW, WW, WW, WW, WF, _],  // 9
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 10
    [_, WF, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WW, WF, _],  // 11
    [_, WF, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WL, WF, _],  // 12 底部陰影
    [_, _, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, _, _],  // 13 外框底
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, WF, WF, WF, WF, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 14 筆槽
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 15
  ];

  // ========================================
  // 窗戶：32×32（含窗簾和光線）
  // ========================================
  const FR = '#8B7355'; // 窗框
  const FD = '#6B5335'; // 窗框暗
  const LB = '#AADDFF'; // 天空藍
  const LD = '#88BBEE'; // 天空暗
  const CT = '#CC6644'; // 窗簾
  const CD2 = '#AA5533'; // 窗簾暗

  const WINDOW_SPRITE = [
    [_, _, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, _, _],  // 0  窗框頂
    [_, FR, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FR, _],  // 1
    [FR, FD, CT, CT, CT, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, CT, CT, CT, FD, FR],  // 2 窗簾+天空
    [FR, FD, CT, CD2, CT, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, CT, CD2, CT, FD, FR],  // 3
    [FR, FD, CT, CT, CT, LB, LB, LB, LD, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LD, LB, LB, LB, LB, CT, CT, CT, FD, FR],  // 4
    [FR, FD, CT, CD2, _, LB, LB, LB, LB, LB, LB, LD, LB, LB, LB, FR, FR, LB, LB, LB, LD, LB, LB, LB, LB, LB, LB, _, CD2, CT, FD, FR],  // 5
    [FR, FD, CT, CT, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, CT, CT, FD, FR],  // 6
    [FR, FD, CT, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, CT, FD, FR],  // 7
    [FR, FD, _, _, _, LB, LB, LD, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LD, LB, LB, _, _, _, FD, FR],  // 8
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 9
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 10
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LD, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LD, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 11
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 12
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 13
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 14
    [FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR],  // 15 中間橫樑
    [FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR],  // 16
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 17
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 18
    [FR, FD, _, _, _, LB, LB, LD, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LD, LB, LB, LB, _, _, _, FD, FR],  // 19
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LD, LB, LB, LB, FR, FR, LB, LB, LB, LD, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 20
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 21
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 22
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 23
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 24
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 25
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 26
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LD, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LD, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 27
    [FR, FD, _, _, _, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, FR, FR, LB, LB, LB, LB, LB, LB, LB, LB, LB, LB, _, _, _, FD, FR],  // 28
    [_, FR, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FD, FR, _],  // 29
    [_, _, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, FR, _, _],  // 30 窗框底
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 31
  ];

  // ========================================
  // 時鐘：16×16（圓形掛鐘）
  // ========================================
  const CK = '#888888'; // 鐘殼灰
  const CKD = '#666666'; // 鐘殼暗灰
  const CKF = '#F5F5F5'; // 鐘面白
  const CKH = '#222222'; // 指針黑
  const CKR = '#CC2222'; // 秒針紅

  const CLOCK = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 0
    [_, _, _, _, _, CK, CK, CK, CK, CK, CK, _, _, _, _, _],  // 1
    [_, _, _, _, CK, CKD, CKD, CKD, CKD, CKD, CKD, CK, _, _, _, _],  // 2
    [_, _, _, CK, CKD, CKF, CKF, CKF, CKF, CKF, CKF, CKD, CK, _, _, _],  // 3
    [_, _, CK, CKD, CKF, CKF, CKF, CKH, CKF, CKF, CKF, CKF, CKD, CK, _, _],  // 4 12 點標記
    [_, _, CK, CKD, CKF, CKF, CKF, CKH, CKF, CKF, CKF, CKF, CKD, CK, _, _],  // 5
    [_, CK, CKD, CKF, CKF, CKF, CKF, CKH, CKF, CKF, CKF, CKF, CKF, CKD, CK, _],  // 6
    [_, CK, CKD, CKF, CKH, CKF, CKF, CKH, CKH, CKH, CKF, CKF, CKH, CKD, CK, _],  // 7 3,9 點 + 時針
    [_, CK, CKD, CKF, CKF, CKF, CKF, CKH, CKF, CKF, CKF, CKF, CKF, CKD, CK, _],  // 8
    [_, CK, CKD, CKF, CKF, CKF, CKF, CKR, CKF, CKF, CKF, CKF, CKF, CKD, CK, _],  // 9 秒針（向下）
    [_, _, CK, CKD, CKF, CKF, CKF, CKR, CKF, CKF, CKF, CKF, CKD, CK, _, _],  // 10
    [_, _, CK, CKD, CKF, CKF, CKF, CKH, CKF, CKF, CKF, CKF, CKD, CK, _, _],  // 11 6 點標記
    [_, _, _, CK, CKD, CKF, CKF, CKF, CKF, CKF, CKF, CKD, CK, _, _, _],  // 12
    [_, _, _, _, CK, CKD, CKD, CKD, CKD, CKD, CKD, CK, _, _, _, _],  // 13
    [_, _, _, _, _, CK, CK, CK, CK, CK, CK, _, _, _, _, _],  // 14
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 15
  ];

  return {
    DESK, CHAIR_DOWN, CHAIR_UP, CHAIR_RIGHT, CHAIR_LEFT,
    PC, BOOKSHELF, PLANT, COFFEE_MACHINE, WHITEBOARD, WINDOW_SPRITE, CLOCK
  };
})();
