// Reading controls only. No account connection, message access or sending.
for (const button of document.querySelectorAll('[data-location]')) button.addEventListener('click', () => {
  const local = button.dataset.location === 'local';
  for (const tab of document.querySelectorAll('[data-location]')) tab.setAttribute('aria-selected', String(tab === button));
  document.querySelector('#local-panel').hidden = !local;
  document.querySelector('#remote-panel').hidden = local;
});
document.querySelector('[role="tablist"]')?.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll('[data-location]')];
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + 1) % tabs.length;
  tabs[next].focus(); tabs[next].click();
});
const dialog = document.querySelector('#screen-dialog');
for (const button of document.querySelectorAll('[data-zoom]')) button.addEventListener('click', () => {
  const image = button.querySelector('img');
  Object.assign(dialog.querySelector('img'), { src: image.src, alt: image.alt });
  dialog.querySelector('p').textContent = button.closest('figure').querySelector('figcaption').textContent;
  dialog.showModal();
});
document.querySelector('#close-screen')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.documentElement.dataset.tutorialReady = 'true';
