const Renderer = (() => {
  const TILE_SIZE = 16;
  const SCALE = 3; // 16px × 3 = 48px display size

  // Draw a hex[][] sprite to canvas at (x, y)
  function drawSprite(ctx, sprite, x, y, scale) {
    const s = scale || SCALE;
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const color = sprite[row][col];
        if (!color || color === '') continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + col * s, y + row * s, s, s);
      }
    }
  }

  // Flip sprite horizontally (for LEFT direction from RIGHT)
  function flipHorizontal(sprite) {
    return sprite.map(row => [...row].reverse());
  }

  // Replace colors in sprite using palette mapping
  function recolor(sprite, fromPalette, toPalette) {
    const map = {};
    for (const key of Object.keys(fromPalette)) {
      if (fromPalette[key] && toPalette[key]) {
        map[fromPalette[key].toUpperCase()] = toPalette[key];
      }
    }
    return sprite.map(row =>
      row.map(color => {
        if (!color) return color;
        return map[color.toUpperCase()] || color;
      })
    );
  }

  // Convert hex to RGB
  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  // Convert RGB to hex
  function rgbToHex(r, g, b) {
    const toHex = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  // RGB to HSL
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s, l };
  }

  // HSL to RGB
  function hslToRgb(h, s, l) {
    h /= 360;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  // Hue shift a hex color by degrees
  function hueShift(hex, degrees) {
    if (!hex || hex === '') return hex;
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Colorize a grayscale sprite with a target hue/saturation (for floor tiles)
  function colorize(sprite, hue, saturation, contrast, brightness) {
    const sat = (saturation || 50) / 100;
    const con = contrast || 1;
    const bri = (brightness || 0) / 200;
    return sprite.map(row => row.map(color => {
      if (!color) return color;
      const { r, g, b } = hexToRgb(color);
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lum = 0.5 + (lum - 0.5) * con;
      lum = Math.max(0, Math.min(1, lum + bri));
      const rgb = hslToRgb(hue || 0, sat, lum);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }));
  }

  // Draw a filled rect with pixel grid lines (for debugging)
  function drawTileOutline(ctx, col, row, color) {
    const x = col * TILE_SIZE * SCALE;
    const y = row * TILE_SIZE * SCALE;
    const s = TILE_SIZE * SCALE;
    ctx.strokeStyle = color || 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, s, s);
  }

  return {
    TILE_SIZE, SCALE,
    drawSprite, flipHorizontal, recolor,
    hueShift, colorize, drawTileOutline,
    hexToRgb, rgbToHex, rgbToHsl, hslToRgb
  };
})();
