// 角色 sprite 資料 — 16×24 pixel art，chibi 比例
// 使用 hex[][] 格式，每個元素為 '#RRGGBB' 或 '' (透明)
const CharacterSprites = (() => {
  const _ = '';           // 透明
  const SK = '#FFCC99';   // 膚色
  const HR = '#553322';   // 髮色
  const SH = '#4488CC';   // 上衣
  const PN = '#334466';   // 褲子
  const SZ = '#222222';   // 鞋子
  const EY = '#000000';   // 瞳孔
  const WH = '#FFFFFF';   // 眼白
  const MT = '#CC8855';   // 膚色陰影/嘴巴
  const HL = '#664433';   // 髮色高光
  const SD = '#3A76B0';   // 上衣陰影
  const PS = '#283850';   // 褲子陰影

  // ========================================
  // DOWN 方向 — 面向觀眾
  // ========================================

  // 站立（idle）
  const down_walk_stand = [
    //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],  // 0  頭頂髮
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],  // 1  髮
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],  // 2  髮（滿）
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],  // 3  額頭髮際線
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],  // 4  額頭
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],  // 5  眼睛
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],  // 6  鼻子
    [_, _, _, SK, SK, SK, SK, MT, MT, SK, SK, SK, SK, _, _, _],  // 7  嘴巴
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],  // 8  下巴
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],  // 9  脖子/領口
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],  // 10 上衣
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],  // 11 上衣+手臂
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],  // 12 上衣陰影
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],  // 13 上衣下緣
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],  // 14 腰
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],  // 15 褲子
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],  // 16 褲子
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],  // 17 褲腿分開
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],  // 18 褲腿
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],  // 19 褲腳
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],  // 20 鞋子
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],  // 21 鞋底
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 22 留空
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],  // 23 留空
  ];

  // 行走（左腳前）
  const down_walk_step = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, MT, MT, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, PN, PN, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, _, PN, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, _, PN, PN, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, _, SZ, SZ, _, _, _],
    [_, _, _, SZ, SZ, SZ, _, _, _, _, SZ, SZ, SZ, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 打字 frame 1（坐姿，手前伸）
  const down_type_1 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, MT, MT, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 打字 frame 2（手微移）
  const down_type_2 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, MT, MT, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, SK, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 閱讀 frame 1（坐姿，頭略左）
  const down_read_1 = [
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, SK, _, _, _],
    [_, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, SK, SK, SK, SK, MT, MT, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 閱讀 frame 2（坐姿，頭略右）
  const down_read_2 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, _, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, MT, MT, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 睡覺 frame 1（趴在桌上）
  const down_sleep_1 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, EY, EY, SK, SK, EY, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SH, SH, SH, SD, SH, SH, SD, SH, SH, SH, SK, _, _],
    [_, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 睡覺 frame 2（略微下沉）
  const down_sleep_2 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, EY, EY, SK, SK, EY, EY, SK, SK, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SH, SH, SH, SD, SH, SH, SD, SH, SH, SH, SK, _, _],
    [_, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _,  _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 慶祝 frame 1（雙手舉起）
  const down_celebrate_1 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, MT, MT, MT, MT, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, SK, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, SK, _],
    [_, SK, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, SK, _],
    [_, _, _, _, SH, SH, SD, SH, SH, SD, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 慶祝 frame 2（手更高 + 跳起）
  const down_celebrate_2 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, SK, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, SK, _],
    [SK, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, SK],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, MT, MT, MT, MT, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SD, SH, SH, SD, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // 慶祝 frame 3（手放下，回到地面）
  const down_celebrate_3 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, SK, SK, SK, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, SK, SK, WH, EY, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, SK, SK, SK, MT, MT, MT, MT, SK, SK, SK, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // ========================================
  // UP 方向 — 背對觀眾（全髮色，無臉）
  // ========================================

  const up_walk_stand = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_walk_step = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, PN, PN, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, _, PN, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, _, PN, PN, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, _, SZ, SZ, _, _, _],
    [_, _, _, SZ, SZ, SZ, _, _, _, _, SZ, SZ, SZ, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_type_1 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_type_2 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, SK, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_read_1 = [
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, SK, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_read_2 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, _, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _],
    [_, _, SK, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, SK, _, _],
    [_, _, SK, _, SH, SH, SH, SH, SH, SH, SH, SH, _, SK, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, PN, _, _, PN, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_sleep_1 = down_sleep_1; // 從後面看趴睡和前面一樣
  const up_sleep_2 = down_sleep_2;

  const up_celebrate_1 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, SK, _, _, SH, SH, SH, SH, SH, SH, _, _, SK, _, _],
    [_, SK, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, SK, _],
    [_, SK, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, SK, _],
    [_, _, _, _, SH, SH, SD, SH, SH, SD, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_celebrate_2 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, SK, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, SK, _],
    [SK, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, SK],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SD, SH, SH, SD, SH, SH, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const up_celebrate_3 = [
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, HR, HR, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, SK, SK, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, SH, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SD, SH, SH, SD, SH, SH, SK, _, _, _],
    [_, _, _, SK, SH, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, SK, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, PN, PN, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, SZ, SZ, SZ, _, _, SZ, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // ========================================
  // RIGHT 方向 — 側面（較窄身體，一隻眼睛）
  // ========================================

  const right_walk_stand = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, SK, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_walk_step = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, SK, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, PN, PN, _, _, PN, PN, _, _, _, _, _],
    [_, _, _, _, _, PN, _, _, _, _, PN, _, _, _, _, _],
    [_, _, _, _, PN, PN, _, _, _, _, PN, PN, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, SZ, SZ, _, _, _, _, SZ, SZ, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_type_1 = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_type_2 = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, _, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_read_1 = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_read_2 = [
    [_, _, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _],
    [_, _, _, _, _, HR, HR, SK, SK, SK, SK, SK, HR, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, WH, EY, SK, SK, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, SK, SK, _, _, _],
    [_, _, _, _, _, _, _, SK, SK, SK, MT, SK, SK, _, _, _],
    [_, _, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_sleep_1 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, EY, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_sleep_2 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, EY, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SH, SK, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, PN, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, SZ, SZ, _, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_celebrate_1 = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, MT, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, SK, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, SK, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_celebrate_2 = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, SK, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, SK, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, MT, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  const right_celebrate_3 = [
    [_, _, _, _, _, _, HR, HR, HR, HR, HR, _, _, _, _, _],
    [_, _, _, _, _, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, HR, HR, HR, HR, HR, _, _, _, _],
    [_, _, _, _, HR, HR, HR, SK, SK, SK, SK, HR, _, _, _, _],
    [_, _, _, _, HR, HR, SK, SK, WH, EY, SK, SK, _, _, _, _],
    [_, _, _, _, _, HR, SK, SK, SK, SK, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, MT, MT, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SK, SK, SK, SK, SK, _, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, _, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, _, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SD, SH, SH, SH, SK, _, _, _, _],
    [_, _, _, _, _, SH, SH, SH, SH, SH, SK, SK, _, _, _, _],
    [_, _, _, _, _, _, SH, SH, SH, SH, SK, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, PN, PN, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, PN, _, _, PN, _, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, SZ, SZ, _, SZ, SZ, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  ];

  // ========================================
  // Sprite 查詢表
  // ========================================
  const SPRITES = {
    down: {
      walk_stand: down_walk_stand,
      walk_step:  down_walk_step,
      type_1:     down_type_1,
      type_2:     down_type_2,
      read_1:     down_read_1,
      read_2:     down_read_2,
      sleep_1:    down_sleep_1,
      sleep_2:    down_sleep_2,
      celebrate_1: down_celebrate_1,
      celebrate_2: down_celebrate_2,
      celebrate_3: down_celebrate_3,
    },
    up: {
      walk_stand: up_walk_stand,
      walk_step:  up_walk_step,
      type_1:     up_type_1,
      type_2:     up_type_2,
      read_1:     up_read_1,
      read_2:     up_read_2,
      sleep_1:    up_sleep_1,
      sleep_2:    up_sleep_2,
      celebrate_1: up_celebrate_1,
      celebrate_2: up_celebrate_2,
      celebrate_3: up_celebrate_3,
    },
    right: {
      walk_stand: right_walk_stand,
      walk_step:  right_walk_step,
      type_1:     right_type_1,
      type_2:     right_type_2,
      read_1:     right_read_1,
      read_2:     right_read_2,
      sleep_1:    right_sleep_1,
      sleep_2:    right_sleep_2,
      celebrate_1: right_celebrate_1,
      celebrate_2: right_celebrate_2,
      celebrate_3: right_celebrate_3,
    },
  };

  // ========================================
  // 調色盤系統
  // ========================================
  const TEMPLATE_PALETTE = {
    skin: '#FFCC99', hair: '#553322', shirt: '#4488CC', pants: '#334466', shoes: '#222222'
  };

  const PALETTES = [
    { skin: '#FFCC99', hair: '#553322', shirt: '#4488CC', pants: '#334466', shoes: '#222222' }, // 藍色（預設）
    { skin: '#FFCC99', hair: '#8B4513', shirt: '#CC4444', pants: '#443333', shoes: '#1A1A1A' }, // 紅色
    { skin: '#F5DEB3', hair: '#2F4F4F', shirt: '#44AA66', pants: '#2D4A3E', shoes: '#333333' }, // 綠色
    { skin: '#DEB887', hair: '#1A1A2E', shirt: '#9966CC', pants: '#3D2E5C', shoes: '#2A2A2A' }, // 紫色
    { skin: '#FFDAB9', hair: '#B8860B', shirt: '#CCAA44', pants: '#5C4A22', shoes: '#1A1A1A' }, // 黃色
    { skin: '#FFE4C4', hair: '#A0522D', shirt: '#CC7744', pants: '#4A3322', shoes: '#222222' }, // 橙色
  ];

  // 用 recolor 時需要的映射：模板顏色 → 目標顏色
  // 包含衍生色（陰影色會按比例映射）
  function buildPaletteMap(targetPalette) {
    return {
      skin:  targetPalette.skin,
      hair:  targetPalette.hair,
      shirt: targetPalette.shirt,
      pants: targetPalette.pants,
      shoes: targetPalette.shoes,
    };
  }

  // 取得指定索引的調色盤（超出範圍時用 hueShift 生成）
  function getPalette(index) {
    if (index < PALETTES.length) return PALETTES[index];
    const base = PALETTES[index % PALETTES.length];
    const shift = 45 + ((index - PALETTES.length) * 60) % 270;
    return {
      skin: base.skin,
      hair: Renderer.hueShift(base.hair, shift),
      shirt: Renderer.hueShift(base.shirt, shift),
      pants: Renderer.hueShift(base.pants, shift),
      shoes: base.shoes,
    };
  }

  // 主要 API：取得可繪製的 hex[][] sprite
  function getSprite(direction, animation, frame, paletteIndex) {
    // LEFT 方向 = 鏡像翻轉 RIGHT
    const actualDir = direction === 'left' ? 'right' : direction;
    const dirSprites = SPRITES[actualDir];
    if (!dirSprites) return null;

    // 組合動畫名稱（如 'walk_stand', 'type_1'）
    const key = frame !== undefined && frame !== null
      ? animation + '_' + frame
      : animation;
    let sprite = dirSprites[key];
    if (!sprite) return null;

    // 調色盤替換
    if (paletteIndex && paletteIndex > 0) {
      const targetPalette = getPalette(paletteIndex);
      const fromMap = buildPaletteMap(PALETTES[0]);
      const toMap = buildPaletteMap(targetPalette);
      sprite = Renderer.recolor(sprite, fromMap, toMap);
    }

    // LEFT 方向水平翻轉
    if (direction === 'left') {
      sprite = Renderer.flipHorizontal(sprite);
    }

    return sprite;
  }

  return { getSprite, getPalette, PALETTES, TEMPLATE_PALETTE };
})();
