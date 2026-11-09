import { recordUsage } from './analytics-ui.js';
import { permissionOrigin } from './bridge/contracts.js';
import { bridgeMessages } from './bridge/ui-i18n.js';
import { createWhatsAppSettings } from './bridge/settings-ui.js';
const api = globalThis.browser ?? globalThis.chrome;
recordUsage('bridge_open', api);
const language = api.i18n.getMessage('language') || api.i18n.getUILanguage();
const t = bridgeMessages(language), $ = selector => document.querySelector(selector);
document.documentElement.lang = language;
for (const node of document.querySelectorAll('[data-ui]')) node.textContent = t[node.dataset.ui];
for (const node of document.querySelectorAll('[data-ui-placeholder]')) node.placeholder = t[node.dataset.uiPlaceholder];
const settingsEditor = createWhatsAppSettings(document, t);
settingsEditor.set();
let busy = false, chats = [], selection = new Set(), lastState, settingsOpen = false;
function startControl() { $('#start').disabled = busy || !selection.size || !$('#whatsapp').value || (!$('#incoming').checked && !$('#outgoing').checked) || !$('#consent').checked; }
const status = (text = '', error = false) => { $('#status').textContent = text; $('#status').dataset.error = String(error); };
const send = async payload => {
  const result = await api.runtime.sendMessage(payload);
  if (!result?.ok) throw new Error(result?.code || 'unavailable');
  return result;
};
const action = async fn => {
  if (busy) return;
  busy = true; document.querySelectorAll('button').forEach(button => { button.disabled = true; }); status(t.working);
  try { const message = await fn(); status(typeof message === 'string' ? message : ''); }
  catch (error) { status(({ 'invalid-filter': t.invalidFilter, 'invalid-destination': t.invalidDestination, 'invalid-device': t.invalidDestination, 'configuration-pending': t.configurationRequired })[error.message] || t.error, true); $('#error-code').textContent = error.message; $('#diagnostics').hidden = false; }
  finally { busy = false; await refresh().catch(() => {}); }
};
function renderChats() {
  $('#chats').replaceChildren();
  const query = $('#chat-search').value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
  const filtered = chats.filter(chat => `${chat.name} ${chat.id}`.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().includes(query)).slice(0, 200);
  for (const chat of filtered) {
    const label = document.createElement('label'); label.className = 'check';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = chat.id; checkbox.checked = selection.has(chat.id);
    checkbox.disabled = selection.size >= 50 && !checkbox.checked;
    checkbox.addEventListener('change', () => { checkbox.checked ? selection.add(chat.id) : selection.delete(chat.id); renderChats(); });
    const name = document.createElement('span'); name.textContent = chat.name;
    label.append(checkbox, name); $('#chats').append(label);
  }
  $('#selected-count').textContent = `${selection.size} / 50 · ${t.selected}`;
  settingsEditor.setChats(chats.filter(chat => selection.has(chat.id)));
  if (!filtered.length) $('#chats').textContent = t.noChats;
  startControl();
}
async function loadChats() {
  if (!$('#whatsapp').value) { chats = []; renderChats(); $('#account-id').textContent = t.noWhatsApp; return; }
  const snapshot = await send({ type: 'bridge-chats', tabId: Number($('#whatsapp').value) });
  chats = snapshot.chats; selection = new Set();
  $('#account-id').textContent = `${t.account}: …${snapshot.accountId.split('@')[0].slice(-4)}`;
  renderChats();
}
async function loadTabs() {
  const data = await send({ type: 'bridge-tabs' });
  $('#whatsapp').replaceChildren();
  for (const tab of data.tabs) { const option = document.createElement('option'); option.value = tab.id; option.textContent = tab.title; $('#whatsapp').append(option); }
  await loadChats();
}
async function rebindOptions() {
  const data = await send({ type: 'bridge-tabs' });
  const previous = $('#rebind-tab').value;
  $('#rebind-tab').replaceChildren();
  for (const tab of data.tabs) { const option = document.createElement('option'); option.value = tab.id; option.textContent = tab.title; $('#rebind-tab').append(option); }
  if (data.tabs.some(tab => String(tab.id) === previous)) $('#rebind-tab').value = previous;
}
async function refresh() {
  const result = await send({ type: 'bridge-status' });
  if ((lastState?.binding && !result.binding) || (lastState?.authenticated && !result.authenticated)) {
    settingsOpen = false; settingsEditor.set(); $('#settings-consent').checked = false;
  }
  $('#login').hidden = result.authenticated || Boolean(result.binding);
  $('#setup').hidden = !result.authenticated || Boolean(result.binding);
  $('#connection').hidden = !result.binding;
  $('#whatsapp-settings').hidden = !result.authenticated || (Boolean(result.binding) && !settingsOpen);
  $('#start').hidden = Boolean(result.binding);
  $('#settings-existing-controls').hidden = !result.binding;
  $('#pairing').hidden = !result.pairing;
  if (result.pairing) { $('#user-code').textContent = result.pairing.userCode; $('#verify').href = result.pairing.verificationUri; }
  if (result.authenticated && !result.binding && !lastState?.authenticated) await loadTabs();
  $('#connection-state').textContent = t[result.state] || result.state;
  $('#queue-count').textContent = `${result.pending} · ${t.queued}`;
  $('#last-result').textContent = result.lastResult?.code === 'filtered-out' ? t.sendFiltered : ({accepted: t.lastAccepted, uncertain: t.lastUncertain, rejected: t.lastRejected})[result.lastResult?.status] || '';
  $('#last-result').dataset.state = result.lastResult?.status || '';
  $('#connection-warning').textContent = result.lastError === 'queue-full' ? t.queueFull : result.lastError === 'queue-expired' ? t.expired : result.lastError ? t.error : '';
  document.querySelectorAll('button').forEach(button => { button.disabled = busy; });
  $('#pause').disabled = busy || !result.binding?.enabled;
  $('#resume').disabled = busy || Boolean(result.binding?.enabled);
  if (result.binding?.settingsPending) { $('#resume').disabled = true; $('#connection-warning').textContent = t.settingsPending; }
  $('#save-settings').disabled = busy || !$('#settings-consent').checked;
  settingsEditor.setEnabled(result.binding ? result.binding.inbound : $('#incoming').checked, result.binding ? result.binding.outbound : $('#outgoing').checked);
  if (result.binding) {
    if (!lastState?.binding) await rebindOptions();
    $('#out-secret-field').hidden = !result.binding.outbound;
    $('#in-url').textContent = result.binding.inUrl || '—'; $('#out-url').textContent = result.binding.outUrl || '—';
    $('#copy-in').disabled = busy || !result.binding.inUrl; $('#copy-out').disabled = busy || !result.binding.outUrl;
    $('#application-state').textContent = result.binding.applicationRoute ? (result.binding.settings?.destination?.kind === 'local' ? t.destinationSummaryLocal : t.destinationSummaryRemote) : t.destinationSummaryNone;
    if (lastState?.binding?.connectionId !== result.binding.connectionId || !$('#example').value) $('#example').value = JSON.stringify({ schema: 'relayers.whatsapp.v1', type: 'message.send', commandId: crypto.randomUUID(), connectionId: result.binding.connectionId,
      accountId: result.binding.accountId, chatId: result.binding.chatIds[0], text: t.demoText, expiresAt: new Date(Date.now() + 3600000).toISOString() }, null, 2);
  }
  else { $('#out-secret').value = ''; $('#out-secret').type = 'password'; }
  $('#rebind-button').disabled = busy || !$('#rebind-tab').value;
  if (result.lastError === 'queue-expired') status(t.expired, true);
  if (result.lastError) { $('#error-code').textContent = result.lastError; $('#diagnostics').hidden = false; }
  lastState = result;
  startControl();
}
$('#connect').addEventListener('click', () => action(async () => {
  const server = $('#server').value.trim();
  const permission = { origins: [permissionOrigin(server)], ...(api.runtime.getBrowserInfo ? { data_collection: ['authenticationInfo', 'personalCommunications', 'personallyIdentifyingInfo'] } : {}) };
  if (!await api.permissions.request(permission)) throw new Error('permission-revoked');
  const pairing = await send({ type: 'bridge-begin-auth', server });
  $('#user-code').textContent = pairing.userCode; $('#verify').href = pairing.verificationUri; $('#pairing').hidden = false;
}));
$('#chat-search').addEventListener('input', renderChats);
for (const id of ['incoming', 'outgoing', 'consent']) $(`#${id}`).addEventListener('change', () => {
  startControl(); settingsEditor.setEnabled($('#incoming').checked, $('#outgoing').checked);
});
$('#whatsapp').addEventListener('change', () => action(loadChats));
$('#start').addEventListener('click', () => action(async () => {
  await send({ type: 'bridge-create', tabId: Number($('#whatsapp').value), chatIds: [...selection], inbound: $('#incoming').checked, outbound: $('#outgoing').checked, consent: $('#consent').checked, settings: settingsEditor.get() });
  settingsOpen = false;
}));
$('#edit-settings').addEventListener('click', () => action(async () => {
  if (!settingsOpen) {
    const options = await send({ type: 'bridge-config-options' });
    settingsEditor.setChats(options.chats); settingsEditor.setDevices(options.devices); settingsEditor.set(lastState.binding.settings);
    $('#settings-consent').checked = false; settingsOpen = true;
  }
  $('#whatsapp-settings').hidden = false; $('#whatsapp-settings').scrollIntoView({ block: 'start' });
}));
$('#load-devices').addEventListener('click', () => action(async () => {
  const options = await send({ type: 'bridge-config-options' }); settingsEditor.setDevices(options.devices);
}));
$('#settings-consent').addEventListener('change', () => { $('#save-settings').disabled = busy || !$('#settings-consent').checked; });
$('#save-settings').addEventListener('click', () => action(async () => {
  await send({ type: 'bridge-configure', settings: settingsEditor.get(), consent: $('#settings-consent').checked });
  $('#settings-consent').checked = false;
  return t.settingsSaved;
}));
$('#pause').addEventListener('click', () => action(() => send({ type: 'bridge-pause' })));
$('#resume').addEventListener('click', () => action(async () => {
  const permission = { origins: [permissionOrigin(lastState.server)], ...(api.runtime.getBrowserInfo ? { data_collection: ['authenticationInfo', 'personalCommunications', 'personallyIdentifyingInfo'] } : {}) };
  if (!await api.permissions.request(permission)) throw new Error('permission-revoked');
  await send({ type: 'bridge-resume' });
}));
$('#disconnect').addEventListener('click', () => { if (confirm(t.confirmDisconnect)) action(() => send({ type: 'bridge-disconnect', confirm: true })); });
$('#rebind-button').addEventListener('click', () => action(async () => {
  await send({ type: 'bridge-rebind', tabId: Number($('#rebind-tab').value) });
}));
$('#show-secret').addEventListener('click', () => action(async () => {
  const result = await send({ type: 'bridge-out-secret', confirm: true });
  $('#out-secret').value = result.secret; $('#out-secret').type = 'text'; $('#out-secret').focus(); $('#out-secret').select();
}));
for (const direction of ['in', 'out']) $(`#copy-${direction}`).addEventListener('click', () => action(async () => {
  const value = lastState?.binding?.[direction === 'in' ? 'inUrl' : 'outUrl'];
  if (!value) throw new Error('not-configured');
  await navigator.clipboard.writeText(value);
  return t.addressCopied;
}));
await refresh().catch(() => status(t.error, true));
setInterval(async () => {
  if (busy) return;
  try { if (lastState?.pairing) await send({ type: 'bridge-poll-auth' }); await refresh(); }
  catch { status(t.error, true); }
}, 5000);
document.documentElement.dataset.ready = 'true';
