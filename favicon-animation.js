(() => {
  const icon = document.querySelector('link[rel="icon"]');
  if (!icon) return;
  const fallback = icon.getAttribute('href');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return;

  // Cache one soft flash every 1.8 seconds at favicon resolution.
  const frames = Array.from({ length: 20 }, (_, frame) => {
    context.clearRect(0, 0, 64, 64);
    context.globalAlpha = 0.25 + 0.75 * (1 + Math.cos(frame / 20 * Math.PI * 2)) / 2;
    context.beginPath();
    for (let point = 0; point < 10; point++) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const radius = point % 2 === 0 ? 29 : 13;
      const x = 32 + Math.cos(angle) * radius;
      const y = 32 + Math.sin(angle) * radius;
      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fillStyle = '#89cff0';
    context.fill();
    context.lineWidth = 1.25;
    context.strokeStyle = '#6bb7df';
    context.stroke();
    return canvas.toDataURL('image/png');
  });

  let timer;
  function start() {
    clearInterval(timer);
    icon.type = reducedMotion.matches ? 'image/svg+xml' : 'image/png';
    icon.href = reducedMotion.matches ? fallback : frames[0];
    if (reducedMotion.matches) return;
    let frame = 0;
    timer = setInterval(() => {
      frame = (frame + 1) % frames.length;
      icon.href = frames[frame];
    }, 90);
  }
  reducedMotion.addEventListener('change', start);
  window.addEventListener('pagehide', () => clearInterval(timer));
  window.addEventListener('pageshow', start);
  start();
})();
