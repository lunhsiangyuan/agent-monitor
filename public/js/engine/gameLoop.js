// ── Game Loop ──
const GameLoop = (() => {
  let canvas, ctx;
  let lastTime = 0;
  let running = false;
  const FPS = 30;
  const FRAME_DURATION = 1000 / FPS;
  const entities = [];

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    resize();
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(timestamp) {
    if (!running) return;
    const delta = timestamp - lastTime;
    if (delta >= FRAME_DURATION) {
      lastTime = timestamp - (delta % FRAME_DURATION);
      update(delta);
      render();
    }
    requestAnimationFrame(loop);
  }

  function update(delta) {
    for (const entity of entities) {
      if (entity.update) entity.update(delta);
    }
  }

  function render() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    const drawables = entities.filter(e => e.draw);
    drawables.sort((a, b) => (a.zY || 0) - (b.zY || 0));
    for (const d of drawables) {
      d.draw(ctx);
    }
  }

  function addEntity(e) { entities.push(e); }
  function removeEntity(e) {
    const i = entities.indexOf(e);
    if (i >= 0) entities.splice(i, 1);
  }
  function clearEntities() { entities.length = 0; }

  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false; // 像素完美
  }

  function getCtx() { return ctx; }
  function getCanvas() { return canvas; }
  function getSize() {
    if (!canvas) return { w: 0, h: 0 };
    const dpr = window.devicePixelRatio || 1;
    return { w: canvas.width / dpr, h: canvas.height / dpr };
  }
  function stop() { running = false; }
  function isRunning() { return running; }

  return { init, addEntity, removeEntity, clearEntities, resize, getCtx, getCanvas, getSize, stop, isRunning };
})();

window.addEventListener('resize', () => GameLoop.resize());
