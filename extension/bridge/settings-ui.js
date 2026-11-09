import { normalizeSettings, matchesFilter } from './filters.js';

export function createWhatsAppSettings(document, t) {
  const host = document.querySelector('#whatsapp-settings');
  const $ = selector => host.querySelector(selector);
  let allowedChats = [], devices = [];
  const option = (value, label) => { const node = document.createElement('option'); node.value = value; node.textContent = label; return node; };
  function row(direction, initial = { field: 'text', operator: 'contains', value: '' }) {
    const node = document.createElement('div'); node.className = 'filter-row';
    const field = document.createElement('select'); field.dataset.field = ''; field.setAttribute('aria-label', t.filterField);
    field.append(option('text', t.fieldText), option('chatId', t.fieldConversation));
    if (direction === 'in') field.append(option('type', t.fieldType));
    field.value = initial.field;
    const operator = document.createElement('select'); operator.dataset.operator = ''; operator.setAttribute('aria-label', t.filterOperator);
    const valueHost = document.createElement('span'); valueHost.className = 'filter-value';
    function renderValue(value = '') {
      const nonText = field.value !== 'text';
      operator.replaceChildren(...(nonText ? [option('equals', t.opEquals)] : [option('contains', t.opContains), option('notContains', t.opNotContains), option('equals', t.opEquals), option('startsWith', t.opStartsWith)]));
      let input;
      if (field.value === 'chatId') {
        input = document.createElement('select');
        for (const chat of allowedChats) input.append(option(chat.id, chat.name));
      } else if (field.value === 'type') {
        input = document.createElement('select');
        for (const type of ['chat', 'image', 'video', 'ptt', 'audio', 'document', 'sticker']) input.append(option(type, t['type_' + type]));
      } else { input = document.createElement('input'); input.type = 'text'; input.maxLength = 200; input.placeholder = t.conditionPlaceholder; }
      input.dataset.value = ''; input.setAttribute('aria-label', t.filterValue);
      if (value) input.value = value;
      valueHost.replaceChildren(input);
    }
    renderValue(initial.value); operator.value = initial.operator;
    field.addEventListener('change', () => renderValue());
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'subtle remove-condition'; remove.textContent = t.removeCondition;
    remove.addEventListener('click', () => node.remove());
    node.append(field, operator, valueHost, remove); return node;
  }
  for (const direction of ['in', 'out']) {
    const panel = document.createElement('fieldset'); panel.id = `filter-${direction}`; panel.className = `direction-card direction-${direction}`;
    const legend = document.createElement('legend'); legend.textContent = direction === 'in' ? t.receiveSettings : t.sendSettings;
    const badge = document.createElement('span'); badge.className = 'direction-badge'; badge.textContent = direction.toUpperCase(); legend.append(' ', badge);
    const modeLabel = document.createElement('label'); modeLabel.htmlFor = `${direction}-filter-mode`; modeLabel.textContent = t.filterMode;
    const mode = document.createElement('select'); mode.id = `${direction}-filter-mode`; mode.append(option('basic', t.basicMode), option('advanced', t.advancedMode));
    const basic = document.createElement('div'); basic.dataset.basic = '';
    const wordsLabel = document.createElement('label'); wordsLabel.htmlFor = `${direction}-words`; wordsLabel.textContent = t.filterWords;
    const words = document.createElement('input'); words.id = `${direction}-words`; words.maxLength = 2000; words.placeholder = t.wordsPlaceholder;
    const wordHelp = document.createElement('p'); wordHelp.className = 'help'; wordHelp.textContent = t.wordsHelp; basic.append(wordsLabel, words, wordHelp);
    const advanced = document.createElement('div'); advanced.dataset.advanced = ''; advanced.hidden = true;
    const matchLabel = document.createElement('label'); matchLabel.htmlFor = `${direction}-match`; matchLabel.textContent = t.combineConditions;
    const match = document.createElement('select'); match.id = `${direction}-match`; match.append(option('all', t.matchAll), option('any', t.matchAny));
    const conditions = document.createElement('div'); conditions.id = `${direction}-conditions`;
    const add = document.createElement('button'); add.type = 'button'; add.id = `${direction}-add-condition`; add.className = 'subtle'; add.textContent = t.addCondition;
    add.addEventListener('click', () => { if (conditions.children.length < 10) conditions.append(row(direction)); });
    const advancedHelp = document.createElement('p'); advancedHelp.className = 'help'; advancedHelp.textContent = t.advancedHelp;
    advanced.append(matchLabel, match, conditions, add, advancedHelp);
    mode.addEventListener('change', () => { basic.hidden = mode.value !== 'basic'; advanced.hidden = mode.value !== 'advanced'; });
    const preview = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = t.previewFilter;
    const sampleLabel = document.createElement('label'); sampleLabel.htmlFor = `${direction}-sample`; sampleLabel.textContent = t.sampleText;
    const sample = document.createElement('input'); sample.id = `${direction}-sample`; sample.maxLength = 1000; sample.placeholder = t.samplePlaceholder;
    const test = document.createElement('button'); test.type = 'button'; test.id = `${direction}-test-filter`; test.className = 'subtle'; test.textContent = t.testFilter;
    const result = document.createElement('p'); result.id = `${direction}-filter-result`; result.setAttribute('role', 'status');
    const previewHelp = document.createElement('p'); previewHelp.className = 'help'; previewHelp.textContent = t.previewHelp;
    test.addEventListener('click', () => {
      try { result.textContent = matchesFilter(readFilter(direction), { text: sample.value, type: 'chat', chatId: allowedChats[0]?.id ?? '' }) ? t.filterPass : t.filterBlock; }
      catch { result.textContent = t.invalidFilter; }
    });
    preview.append(summary, sampleLabel, sample, test, result, previewHelp);
    panel.append(legend, modeLabel, mode, basic, advanced, preview);
    $('#filter-cards').append(panel);
  }
  function readFilter(direction) {
    const mode = $(`#${direction}-filter-mode`).value;
    return mode === 'basic' ? { mode, match: 'any', conditions: $(`#${direction}-words`).value.split(',').map(value => value.trim()).filter(Boolean).map(value => ({ field: 'text', operator: 'contains', value })) }
      : { mode, match: $(`#${direction}-match`).value, conditions: [...$(`#${direction}-conditions`).children].map(node => ({ field: node.querySelector('[data-field]').value,
        operator: node.querySelector('[data-operator]').value, value: node.querySelector('[data-value]').value })) };
  }
  function destinationView() {
    const kind = $('#destination-kind').value;
    $('#destination-fields').hidden = kind === 'none';
    $('#destination-device-field').hidden = kind !== 'local';
    $('#destination-url').placeholder = kind === 'local' ? 'http://127.0.0.1:3000/messages' : 'https://example.com/messages';
  }
  $('#destination-kind').addEventListener('change', destinationView);
  const renderDevices = () => {
    const previous = $('#destination-device').value;
    $('#destination-device').replaceChildren(option('', t.selectDevice), ...devices.map(device => option(device.id, device.name)));
    $('#destination-device').value = previous;
  };
  return {
    get() { return normalizeSettings({ incomingFilter: $('#filter-in').disabled ? undefined : readFilter('in'), outgoingFilter: $('#filter-out').disabled ? undefined : readFilter('out'),
      destination: $('#destination-settings').disabled ? { kind: 'none' } : { kind: $('#destination-kind').value,
      url: $('#destination-url').value.trim(), daemonId: $('#destination-device').value } }); },
    set(value) {
      const settings = normalizeSettings(value);
      for (const direction of ['in', 'out']) {
        const filter = direction === 'in' ? settings.incomingFilter : settings.outgoingFilter;
        $(`#${direction}-filter-mode`).value = filter.mode;
        $(`#${direction}-words`).value = filter.conditions.filter(item => item.field === 'text' && item.operator === 'contains').map(item => item.value).join(', ');
        $(`#${direction}-match`).value = filter.match;
        $(`#${direction}-conditions`).replaceChildren(...filter.conditions.map(condition => row(direction, condition)));
        $(`#${direction}-filter-mode`).dispatchEvent(new Event('change'));
        $(`#${direction}-sample`).value = ''; $(`#${direction}-filter-result`).textContent = '';
      }
      $('#destination-kind').value = settings.destination.kind;
      $('#destination-url').value = settings.destination.url || '';
      if (settings.destination.daemonId && !devices.some(device => device.id === settings.destination.daemonId)) devices.push({ id: settings.destination.daemonId, name: t.selectedDevice });
      renderDevices(); $('#destination-device').value = settings.destination.daemonId || '';
      destinationView();
    },
    setChats(value) { allowedChats = value; },
    setDevices(value) { devices = value; renderDevices(); },
    setEnabled(incoming, outgoing) { $('#filter-in').disabled = !incoming; $('#filter-out').disabled = !outgoing; $('#destination-settings').disabled = !incoming; }
  };
}
