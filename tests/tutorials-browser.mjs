import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('site');
const catalogs = JSON.parse(await readFile('site/tutorials/content.json', 'utf8'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(root + '/')) throw new Error('Outside site');
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: process.env.SITE_BROWSER_CHANNEL || 'chromium', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => localStorage.setItem('relayers-bridge:analytics-consent:v1', JSON.stringify({ value: 'rejected', at: Date.now() })));
  const errors = [], external = [], failures = [];
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    external.push(route.request().url()); return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await mkdir('artifacts', { recursive: true });
  for (const [locale, t] of Object.entries(catalogs)) {
    const base = '/tutorials/' + t.path;
    await page.goto(origin + base);
    await page.waitForFunction(() => document.documentElement.dataset.tutorialReady === 'true');
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
    assert.equal(await page.locator('.story-card').count(), 4);
    assert.equal(await page.locator('.account-link').getAttribute('href'), 'https://panel.relayers.app/login');
    if (locale === 'pt-BR') await page.screenshot({ path: 'artifacts/tutorial-library-desktop.png', fullPage: true });
    for (const a of t.articles) {
      await page.goto(origin + base + a.slug + '.html');
      await page.waitForFunction(() => document.documentElement.dataset.tutorialReady === 'true');
      assert.equal(await page.locator('h1').innerText(), a.title);
      assert.equal(await page.locator('.step-section').count(), a.steps.length);
      assert.equal(await page.locator('pre,code').count(), 0, 'Business guides must contain no code samples');
      assert.doesNotMatch(await page.locator('main').innerText(), /HMAC|JSON|API key|WebSocket|Bearer|localhost:\d|http_method/i);
      assert.equal(await page.locator('svg.flow').count(), 2);
      assert.equal(await page.locator('.proof-note').innerText().then(text => text.includes(t.testedText)), true);
      // Verify the complete static article, image resources and table of contents.
      assert.ok((await (await page.request.get(origin + base + a.slug + '.html')).text()).includes(a.title));
      const broken = await page.locator('a[href^="#"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')).filter(href => !document.getElementById(href.slice(1))));
      assert.deepEqual(broken, []);
      const badImages = await page.locator('img').evaluateAll(async nodes => {
        for (const image of nodes) image.loading = 'eager';
        return (await Promise.all(nodes.map(async image => { try { await image.decode(); return null; } catch { return image.src; } }))).filter(Boolean);
      });
      assert.deepEqual(badImages, []);
      await page.locator('#remote-tab').click();
      assert.equal(await page.locator('#remote-panel').isVisible(), true);
      assert.equal(await page.locator('#local-panel').isVisible(), false);
      assert.ok((await page.locator('#remote-panel').innerText()).includes(t.remoteText));
      await page.locator('#remote-tab').focus(); await page.keyboard.press('Home');
      assert.equal(await page.locator('#local-tab').getAttribute('aria-selected'), 'true');
      const image = page.locator('[data-zoom]').first();
      await image.click(); assert.equal(await page.locator('dialog').isVisible(), true);
      assert.ok(await page.locator('dialog img').getAttribute('alt'));
      await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog').isVisible(), false);
      if (locale === 'pt-BR' && a.key === 'first-connection') {
        assert.equal(await page.locator('#pair a[href="https://panel.relayers.app/login"]').count(), 0, 'Pairing follows the per-device approval link');
        assert.ok((await page.locator('#separate').innerText()).includes('cria dois endereços separados'));
        await page.locator('#two-ways').scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'artifacts/tutorial-directions-desktop.png' });
        await page.locator('#location').screenshot({ path: 'artifacts/tutorial-location-desktop.png' });
      }
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${locale}:${a.key}: no overflow at ${width}`);
        if (width === 390 && locale === 'pt-BR' && a.key === 'first-connection') {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: 'artifacts/tutorial-first-mobile.png' });
        }
      }
      // A language change keeps the same story rather than returning to the index.
      const other = locale === 'en' ? 'pt-BR' : 'en';
      const target = catalogs[other].articles.find(item => item.key === a.key);
      await page.locator(`.languages [hreflang="${other}"]`).click();
      await page.waitForURL(origin + '/tutorials/' + catalogs[other].path + target.slug + '.html');
      assert.equal(await page.locator('h1').innerText(), target.title);
    }
    console.log(`OK tutorials ${locale}: four full articles, illustrations/screenshots, correct sign-in, IN/OUT, local/remote choices, zoom, keyboard, language handoff and mobile layout.`);
  }
  // The homepage promotes the matching library and a visible RELAYERS login.
  await page.goto(origin + '/?lang=pt');
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  assert.equal(await page.locator('.header-actions a').getAttribute('href'), 'https://panel.relayers.app/login');
  await page.locator('#tutorials .button').click();
  await page.waitForURL(origin + '/tutorials/pt-br/');
  assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(failures, []);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
