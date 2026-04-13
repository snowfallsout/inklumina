'use strict';

function loop() {
  requestAnimationFrame(loop);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(245, 248, 255, 1)';
  ctx.fillRect(0, 0, W, H);

  if (_camOn && video.readyState >= 2 && video.videoWidth > 0) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.max(W / vw, H / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(video, dx, dy, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _tickDrawMode();
  for (const p of particles) {
    p.update(faces, emotion);
    p.draw(ctx);
  }
  _drawStrokeOverlay();
  _tickSmileEmoji();

  if (handsResults && handsResults.multiHandLandmarks) {
    for (const lm of handsResults.multiHandLandmarks) {
      const pts = lm.map(p => mapToCanvas(p.x, p.y));

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      for (const pt of pts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, TWO_PI);
        ctx.fill();
      }

      for (const pt of activePinchPoints) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, TWO_PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, TWO_PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}
