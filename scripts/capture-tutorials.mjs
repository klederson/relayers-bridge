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
    if (!location.href.includes('/bridge.html') && !location.href.includes('/popup.html')) return;
    const lang = new URL(location.href).searchParams.get('lang') || sessionStorage.getItem('tutorialCaptureLanguage') || 'en';
    chrome.i18n.getMessage = key => key === 'language' ? lang : '';
    if (location.href.includes('/popup.html')) return;
    const stage = new URL(location.href).searchParams.get('stage') || 'login';
    const binding = { connectionId: '00000000-0000-4000-8000-000000000001', accountId: '12025550000@c.us', chatIds: ['12025550140@c.us'], enabled: true,
      inbound: true, outbound: true, inUrl: 'https://example.invalid/receive-demo', outUrl: 'https://example.invalid/send-demo',
      applicationRoute: stage === 'connected', settings: stage === 'connected' ? { destination: { kind: 'remote', url: 'https://example.invalid/messages' } } : undefined };
    chrome.runtime.sendMessage = async request => {
      const connected = ['connected', 'settings-basic', 'settings-advanced'].includes(stage);
      if (request.type === 'bridge-status') return { ok: true, authenticated: stage === 'setup' || connected,
        binding: connected ? binding : null, pairing: stage === 'pairing' ? { userCode: 'DEMO-2026', verificationUri: 'https://example.invalid/approve' } : null,
        state: connected ? 'connected' : 'disconnected', pending: 0, lastResult: connected ? { status: 'accepted' } : null };
      if (request.type === 'bridge-tabs') return { ok: true, tabs: [{ id: 1, title: 'WhatsApp · Demo' }] };
      if (request.type === 'bridge-chats') return { ok: true, accountId: binding.accountId, chats: [{ id: binding.chatIds[0], name: lang === 'pt' ? 'Bia · Pedido de exemplo' : 'Bia · Example order' }] };
      if (request.type === 'bridge-config-options') return { ok: true, devices: [], chats: [{ id: binding.chatIds[0], name: lang === 'pt' ? 'Bia · Pedido de exemplo' : 'Bia · Example order' }] };
      return { ok: true };
    };
  });
  for (const lang of ['en', 'pt']) {
    const popup = await context.newPage(); await popup.setViewportSize({ width: 390, height: 700 });
    await popup.goto(`${origin}/popup.html`);
    await popup.evaluate(value => sessionStorage.setItem('tutorialCaptureLanguage', value), lang);
    await popup.reload();
    await popup.locator('#bridge-settings-link').waitFor();
    await popup.locator('#composer').waitFor({ state: 'visible' });
    await popup.locator('body').screenshot({ path: join(directory, `bridge-popup-${lang}.jpg`), type: 'jpeg', quality: 90 }); await popup.close();
    for (const stage of ['login', 'pairing', 'setup', 'connected', 'settings-basic', 'settings-advanced']) {
      const page = await context.newPage();
      await page.goto(`${origin}/bridge.html?lang=${lang}&stage=${stage}`);
      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
      if (stage === 'setup') {
        await page.locator('#chats input').check();
        await page.locator('#incoming').check(); await page.locator('#outgoing').check(); await page.locator('#consent').check();
      }
      if (stage.startsWith('settings-')) {
        await page.locator('#edit-settings').click(); await page.locator('#whatsapp-settings').waitFor({ state: 'visible' });
        await page.locator('#in-words').fill(lang === 'pt' ? 'pedido, orçamento' : 'order, quote');
        await page.locator('#out-words').fill(lang === 'pt' ? 'pedido' : 'order');
        await page.locator('#destination-kind').selectOption('remote'); await page.locator('#destination-url').fill('https://example.invalid/messages');
        if (stage === 'settings-advanced') {
          await page.locator('#in-filter-mode').selectOption('advanced');
          await page.locator('#in-match').selectOption('all');
          for (let i = 0; i < 2; i++) await page.locator('#in-add-condition').click();
          await page.locator('#in-conditions [data-value]').nth(0).fill(lang === 'pt' ? 'pedido' : 'order');
          await page.locator('#in-conditions [data-operator]').nth(1).selectOption('notContains');
          await page.locator('#in-conditions [data-value]').nth(1).fill(lang === 'pt' ? 'cancelado' : 'cancelled');
          await page.locator('#filter-in summary').click();
          await page.locator('#in-sample').fill(lang === 'pt' ? 'Pedido pronto' : 'Order ready'); await page.locator('#in-test-filter').click();
        }
      }
      await page.locator(stage.startsWith('settings-') ? '#whatsapp-settings' : 'main').screenshot({ path: join(directory, `bridge-${stage}-${lang}.jpg`), type: 'jpeg', quality: 88 });
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
