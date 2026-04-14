const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://localhost:5173/';
  const out = { console: [], requests: [] };
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    out.console.push({ type: msg.type(), text: msg.text() });
    console.log('[PAGE][console]', msg.type(), msg.text());
  });

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/mediapipe') || url.includes('/socket.io')) {
      out.requests.push({ url, method: req.method() });
      console.log('[PAGE][request]', req.method(), url);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/mediapipe') || url.includes('/socket.io')) {
      console.log('[PAGE][response]', res.status(), url);
    }
  });

  try {
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // wait additional time to let MediaPipe init
    await page.waitForTimeout(8000);
  } catch (e) {
    console.error('Page navigation error:', e && e.message);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();