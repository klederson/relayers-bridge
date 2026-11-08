# Privacy — RELAYERS Bridge

RELAYERS Bridge is open source under MIT. Inspect it at https://github.com/klederson/relayers-bridge. Public source is not a security certification.

## Local features

The extension intercepts supported conversation links and reads loaded WhatsApp chat names, identifiers, unread counts and message previews. Quick replies send only on your explicit Send click. Saved replies and an optional OpenRouter key stay in local extension storage; drafts and manual-send operation records use browser-session storage.

## Explicit RELAYERS connections

Relay is off by default. You choose a server, WhatsApp account, conversations, incoming events and/or automatic outgoing commands. Enabling a connection authorizes the selected directions and disclosed scope. You may pause or disconnect it. No RELAYERS token is injected into the WhatsApp page.

While incoming relay is enabled, message identifiers, account/conversation identifiers, direction, timestamps, text and available captions/type metadata from selected loaded conversations go to that RELAYERS server. Messages may be processed, stored or forwarded by the server and routes you configure, under their policies and retention settings. This extension cannot promise those services never store data. It does not fetch a full historical archive, download media files or open view-once media.

While outgoing automation is enabled, valid commands matching the configured connection, account and conversations may send through the loaded WhatsApp session without a separate click for each command. Manual quick reply still requires its Send click. Acceptance by WhatsApp is not proof of recipient delivery or reading.

Credentials, binding and consent settings use local extension storage, without browser sync. Durable incoming queues temporarily contain selected message content for retry; command journals retain identifiers, fingerprints and results to prevent duplicate sending. Queue and journal bounds/expiry are enforced by the implementation. Do not enable relay on a shared browser profile unless others with access may view that local data.

## Optional AI

AI requires a separately connected user-supplied OpenRouter key. Each Suggest click sends the displayed received text/caption and draft directly to OpenRouter and its AI provider. The key authenticates the request. Their policies govern processing, training and retention; this project cannot make guarantees for them. Media files are not sent to AI. A suggestion does not automatically send a WhatsApp message.

## Control and disclosure

Delete saved replies in their manager; disconnect AI to remove its saved key. Disconnect RELAYERS to stop its transport and remove the local connection credentials and queued content according to the confirmation shown in the UI. It does not delete data already transmitted to WhatsApp, RELAYERS, route destinations or an AI provider; manage that directly with those services.

No advertising, analytics, sale of data or unrelated telemetry is added by this extension. Device connection metadata required for RELAYERS authentication and delivery is part of the declared relay feature. Optional support goes to GitHub Sponsors, where payment requires your confirmation and is governed by GitHub's policies.

Report problems through https://github.com/klederson/relayers-bridge/issues without posting messages, phone numbers, QR codes, API keys, tokens or session data. For a security concern, request a private reporting channel without publicly disclosing sensitive details.

## Project website (separate from the extension)

On the GitHub Pages website, optional Google Analytics measures visits and clicks on downloads or support only after you allow statistics. It uses cookies and receives technical visit information such as page, browser and device information. Our code removes query parameters and fragments from page addresses and does not pass form text, WhatsApp messages, phone numbers, extension activity or credentials to Analytics. Google processes this information under its [privacy policy](https://policies.google.com/privacy).

No Analytics script loads before permission or after a refusal. Use **Visit statistics** in the footer to change your choice. The choice is saved locally for 180 days, separately from TabHero. Revoking permission disables measurement, removes this site's Analytics cookies and reloads this website to unload the tag. The downloaded standalone HTML guide contains no Analytics. GitHub Pages may process hosting access information under [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
