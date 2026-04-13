'use strict';

function bindDisplayEvents() {
  const camToggle = document.getElementById('cam-toggle');
  if (camToggle) camToggle.addEventListener('click', toggleCamera);

  const sessionBtn = document.getElementById('session-btn');
  if (sessionBtn) sessionBtn.addEventListener('click', openSessionPanel);

  const closeBtn = document.getElementById('sp-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSessionPanel);

  const newSessionBtn = document.getElementById('sp-create-btn');
  if (newSessionBtn) newSessionBtn.addEventListener('click', createNewSession);

  const qrBtn = document.getElementById('sp-generate-qr-btn');
  if (qrBtn) qrBtn.addEventListener('click', generateJoinQR);
}

bindDisplayEvents();
renderLegend();
restoreSavedIP();
refreshCornerQR();
seedAmbient(25);
requestAnimationFrame(_processFrame);
setupCamera();
loop();
