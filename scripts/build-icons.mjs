import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const symbol = await readFile(new URL('../brand/symbol.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of [16, 32, 48, 128]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${symbol}`);
    await page.screenshot({ path: new URL(`../extension/icons/${size}.png`, import.meta.url).pathname, omitBackground: true });
  }
} finally { await browser.close(); }
