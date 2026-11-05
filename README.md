# RELAYERS Bridge

Open-source Chrome and Firefox extension connecting a loaded WhatsApp Web session to RELAYERS, with explicit controls for incoming events and outgoing commands.

Derived from the [TabHero](https://github.com/klederson/tabhero) MIT core: conversation links reuse the loaded document, and the toolbar keeps quick reply, conversation search, saved replies, optional AI, media placeholders and the silent unread badge.

## Development

```sh
npm ci
npm test
npm run build
npm run package
```

Load `dist/chrome` as an unpacked extension in Chrome. In Firefox use `about:debugging`, Load Temporary Add-on, and `dist/firefox/manifest.json`. Store distribution is not available yet. This extension has its own identifier and does not need TabHero installed.

Bridge integration is under development. Do not use an experimental build for unattended or critical messaging. Automated WhatsApp and RELAYERS tests use simulated services; authenticated compatibility must be verified separately. No existing WhatsApp document may be navigated or reloaded as a fallback.

## Data and source

Enabling a Bridge connection forwards the selected conversations' disclosed message data to your RELAYERS server. Its routes may forward it onward. Incoming and outgoing operation require separate explicit opt-in, account/conversation binding and visible connection controls. Persistent local queues and command-result records are necessary for recovery and duplicate prevention. This differs from the independent TabHero product. See [PRIVACY.md](PRIVACY.md).

All source in this repository is available under [MIT](LICENSE). See [UPSTREAM.md](UPSTREAM.md) for attribution and snapshot provenance. The RELAYERS backend, internal plans, customer data, credentials and deployed configuration are not part of this public repository. Public source enables inspection; no independent security certification is claimed.

Independent WhatsApp integration. Not affiliated with or endorsed by WhatsApp or Meta. WhatsApp's internal interfaces may change.
