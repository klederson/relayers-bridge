// Real bundled extension screens, fictional account/conversations, no live sends.
import { chromium } from 'playwright';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { dismissChromiumWelcome } from '../tests/installation.mjs';

const directory = resolve('site/tutorials/assets');
await mkdir(directory, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'bridge-tutorial-capture-'));
const extension = resolve('dist/chrome');
const context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true,
  viewport: { width: 1120, height: 1000 }, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
try {
  const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await dismissChromiumWelcome(context);
  const workerUrl = new URL(worker.url());
  const origin = `${workerUrl.protocol}//${workerUrl.host}`;
  const fixture = await readFile(new URL('../tests/fixtures/whatsapp.html', import.meta.url), 'utf8');
  await context.route('https://web.whatsapp.com/**', route => route.fulfill({ contentType: 'text/html', body: fixture }));
  await context.route('https://api.relayers.app/**', route => route.abort());
  const whatsapp = await context.newPage(); await whatsapp.goto('https://web.whatsapp.com/');
  await whatsapp.waitForFunction(() => window.documentToken);
  await context.addInitScript(() => {
    if (!location.href.includes('/bridge.html')) return;
    const lang = new URL(location.href).searchParams.get('lang') || 'en';
    chrome.i18n.getMessage = key => key === 'language' ? lang : '';
    const stage = new URL(location.href).searchParams.get('stage') || 'login';
    const binding = { connectionId: '00000000-0000-4000-8000-000000000001', accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], enabled: true,
      inbound: true, outbound: true, inUrl: 'https://example.invalid/receive-demo', outUrl: 'https://example.invalid/send-demo' };
    chrome.runtime.sendMessage = async request => {
      if (request.type === 'bridge-status') return { ok: true, authenticated: ['setup', 'connected'].includes(stage),
        binding: stage === 'connected' ? binding : null, pairing: stage === 'pairing' ? { userCode: 'DEMO-2026', verificationUri: 'https://example.invalid/approve' } : null,
        state: stage === 'connected' ? 'connected' : 'disconnected', pending: 0, lastResult: stage === 'connected' ? { status: 'accepted' } : null };
      if (request.type === 'bridge-tabs') return { ok: true, tabs: [{ id: 1, title: 'WhatsApp · Demo' }] };
      if (request.type === 'bridge-chats') return { ok: true, accountId: binding.accountId, chats: [{ id: binding.chatIds[0], name: lang === 'pt' ? 'Bia · Pedido de exemplo' : 'Bia · Example order' }] };
      return { ok: true };
    };
  });
  for (const lang of ['en', 'pt']) {
    for (const stage of ['login', 'pairing', 'setup', 'connected']) {
      const page = await context.newPage();
      await page.goto(`${origin}/bridge.html?lang=${lang}&stage=${stage}`);
      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
      if (stage === 'setup') {
        await page.locator('#chats input').check();
        await page.locator('#incoming').check(); await page.locator('#outgoing').check(); await page.locator('#consent').check();
      }
      await page.locator('main').screenshot({ path: join(directory, `bridge-${stage}-${lang}.jpg`), type: 'jpeg', quality: 88 });
      await page.close();
    }
  }
  // Public sign-in page only: no saved account, password, token or device code.
  const login = await context.newPage();
  await login.setViewportSize({ width: 1100, height: 800 });
  await login.goto('https://panel.relayers.app/login', { waitUntil: 'networkidle' });
  await login.getByLabel('Email', { exact: true }).waitFor();
  await login.screenshot({ path: join(directory, 'relayers-login.jpg'), type: 'jpeg', quality: 88 });
  await login.close();
  console.log('Tutorial captures ready: real extension screens with fictional state; public login with no credentials. No WhatsApp message or live connection was created.');
} finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
