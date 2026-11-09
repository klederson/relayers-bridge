[Sponsor development](https://github.com/sponsors/klederson)

# RELAYERS Bridge

**RELAYERS can send messages through your open WhatsApp. Messages you receive in the chats you choose can also go to RELAYERS.**

RELAYERS Bridge is a Firefox and Chrome extension that connects the two sides:

- **Receive — WhatsApp → RELAYERS:** new messages arriving in the chats you chose can go to RELAYERS. You choose what RELAYERS should do with them.
- **Send — RELAYERS → WhatsApp:** your program can ask RELAYERS to send a message, even from somewhere else. Once you allow sending, you do not need to click Send each time.

You choose the account, the chats and what is allowed. Keep the computer, browser and WhatsApp Web available. When replying yourself through the extension, you still click Send. This is a test version and is not an official WhatsApp product.

[Explore the website](https://klederson.github.io/relayers-bridge/) · [Read the protocol](docs/protocol.md) · [Privacy](PRIVACY.md)

Derived from the [TabHero](https://github.com/klederson/tabhero) MIT core: conversation links reuse the loaded document, and the toolbar keeps quick reply, conversation search, saved replies, optional AI, media placeholders and the silent unread badge.

Usage statistics are optional and start off. You may share feature counts and broad error categories; messages and credentials never enter these statistics. Refusing leaves all features available. See [extension statistics](docs/extension-analytics.md) for activation and data handling.

## Install

Chrome: install from the [official Chrome Web Store listing](https://chromewebstore.google.com/detail/kehnlfbcbflddadaogbfeiibhckbfiie).

Firefox: Mozilla approval is pending. The [submitted listing](https://addons.mozilla.org/en-US/firefox/addon/relayers-bridge/) will become available after approval. For now, download the Firefox package from [releases](https://github.com/klederson/relayers-bridge/releases) and follow the temporary installation steps below.

## Development

```sh
npm ci
npm test
npm run build
npm run package
```

For local development, load `dist/chrome` as an unpacked extension in Chrome. In Firefox use `about:debugging`, Load Temporary Add-on, and `dist/firefox/manifest.json`; for a downloaded Firefox ZIP, extract it and select its `manifest.json`. Temporary Firefox installations end when the browser restarts. This extension has its own identifier and does not need TabHero installed. The initial relay supports one active connection per browser profile, in regular windows.

The initial text IN/OUT relay is experimental. See [the public protocol](docs/protocol.md) for payloads, result semantics and limits. A dedicated account on the published RELAYERS test service has passed real panel approval, API, signed HTTP IN/OUT, queue/worker, bound WebSocket and duplicate-command checks. WhatsApp was simulated in that test; compatibility with an authenticated real WhatsApp session still needs validation. No existing WhatsApp document may be navigated or reloaded as a fallback.

## Connect a test account

1. Click the RELAYERS wordmark in the toolbar popup to open connection settings.
2. Connect your RELAYERS account using the displayed device code.
3. Choose the loaded WhatsApp account and conversations; enable IN and/or OUT and confirm the scope. Creating a connection provisions dedicated endpoints and a device-bound OUT route.
4. Configure your workflows in RELAYERS. Integration details show the endpoint URLs, an expiring OUT example and an explicitly revealed OUT signing secret. IN and OUT use separate secrets.
5. Pause, resume or disconnect from the same settings page. After reopening WhatsApp in a new tab, explicitly reattach the same account; another account is rejected.

For a first test in a profile that already has TabHero, disable its link handling by disabling that extension before loading Bridge, so two extensions do not compete for the same conversation links. Leave the WhatsApp document loaded. Do not use real customer conversations to test automatic sending.

Run `npm run test:bridge` for actual loopback HTTP/WebSocket transport with simulated accounts, WhatsApp and consent grants. Core browser checks are available through `test:browser`, `test:quick-reply` and `test:firefox`. The Firefox test also exercises native optional host/data consent, with simulated service approval.

Maintainers can explicitly run the live transport test against an owned test account:

```sh
RELAYERS_LIVE_TEST=1 RELAYERS_LIVE_ACCOUNT_FILE=/absolute/path/to/qa-account.json npm run test:bridge:live
```

Keep that file outside the repository, readable only by its owner. Its JSON fields are `server` (HTTPS API origin), `email` and `password`. The test requires a dedicated `bridge-qa-…@example.invalid` account on your own test service. It always substitutes a WhatsApp fixture, pre-grants the API origin only in an isolated test manifest, creates its own endpoints/device and removes those resources afterward. It never proves real WhatsApp compatibility or sends messages to real recipients. Live tests are excluded from CI.

## Data and source

Enabling a Bridge connection forwards the selected conversations' disclosed message data to your RELAYERS server. Its routes may forward it onward. Incoming and outgoing operation require separate explicit opt-in, account/conversation binding and visible connection controls. Persistent local queues and command-result records are necessary for recovery and duplicate prevention. This differs from the independent TabHero product. See [PRIVACY.md](PRIVACY.md).

All source in this repository is available under [MIT](LICENSE). See [UPSTREAM.md](UPSTREAM.md) for attribution and snapshot provenance. The RELAYERS backend, internal plans, customer data, credentials and deployed configuration are not part of this public repository. Public source enables inspection; no independent security certification is claimed.

Independent WhatsApp integration. Not affiliated with or endorsed by WhatsApp or Meta. WhatsApp's internal interfaces may change.
