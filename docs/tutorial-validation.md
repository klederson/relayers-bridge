# Tutorial validation — 9 November 2026

## Authenticated smoke

The source-built RELAYERS Bridge 0.2.0 was installed in a separate visible Chromium profile. Its extension files were compared with the repository source. The owner authenticated WhatsApp and explicitly supplied the bot to receive the test messages. Only that individual conversation was authorized. RELAYERS used a dedicated owned QA account; no unrelated recipient was contacted.

The first-connection article now supplies a complete application and a sequence of clicks, expected results and recovery hints. Its screenshots and the configuration article’s replacement captures come from the real smoke. Personal contact names and phone numbers are blurred. Sending keys remain in protected fields; private live addresses are blurred. The original hero artwork was preserved, and its generation caption was removed from the public pages.

The completed scenarios were:

- **Local application:** a real OUT request reached the bot; its reply traversed WhatsApp → Bridge → RELAYERS → the included order desk. A reply submitted using the application’s actual interface appeared in WhatsApp, received a recipient delivery acknowledgement and caused a further bot reply to return to the application.
- **Remote application:** the same application ran on a separate remote Linux host, with its own device approval. Its interface was viewed over a private SSH forward; receiving and sending traversed RELAYERS directly from that host. Its OUT request contained no browser login token or cookie. The local application did not receive the remote application’s events.
- **Public HTTPS:** a separate, narrowly scoped receiver on that remote host was exposed through a [temporary HTTPS test tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/). An actual bot reply reached it; the receiver submitted one OUT reply, WhatsApp acknowledged delivery and the bot responded. It used an unguessable receiving path and validated the account, connection and conversation. The input signature is validated at RELAYERS ingestion; the service does not automatically forward that signature header to a public receiving application. The test did not assume otherwise or publish an active receiver credential.
- **Basic filters:** an outgoing command was rejected before native sending; an actual bot response excluded by the incoming filter was observed locally but absent from both RELAYERS ingestion events and the application.
- **Advanced filters:** combined text conditions rejected an outgoing command and admitted a matching send and a new bot reply. Relaxing filters did not backfill the earlier excluded message.
- **Scope and expiry:** a command addressed outside the authorized conversation and a command with expired validity were rejected by the real Bridge path without contacting another recipient.
- **Duplicate suppression:** the same command was delivered through two ingestion events; it produced one native WhatsApp send.
- **Pause/resume:** a request submitted while paused produced no WhatsApp send. After Resume, the queued request sent once and its bot response reached the chosen local application.

Before and after dispatch, checks compared the actual document handle, URL, current conversation, a nonempty composer draft and the active work tab. No WhatsApp navigation or reload was used. The chat was intentionally opened for visual verification outside the dispatch-preservation checks. A document marker created before the first send remained present across the run.

The actual smoke exposed two problems in the tutorial application: expired API access needed renewal, and two loopback applications viewed in one browser needed separate cookies. The application now renews authenticated API access without retrying message submissions, uses a separate cookie for each listening port, and displays an individual device name so a person can choose the correct computer. Unit and browser checks cover the fixes; the real local/remote flow was repeated afterward.

The public evidence summary contains only outcomes and coverage in [real-smoke-2026-11-09.json](real-smoke-2026-11-09.json). Credentials, device approval tokens, recipient identifiers, raw event bodies, private host details and unsanitized captures remain outside this public repository. The temporary public receiver and remote processes are removed after verification; the demonstration connection is left paused.

### Scope

The authenticated smoke covers Chrome/Chromium, plain text and one authorized bot conversation. It is not an authenticated Firefox, group, media, all-filter-combinations or production availability test. Those distinctions remain explicit: fixture tests do not become real-session evidence, and acceptance alone is not a recipient-delivery claim. Delivery and bot responses were separately checked where reported.

## Automated coverage and earlier evidence

The opt-in `test:bridge:live` suite separately uses the real RELAYERS API, approval page, ingestion, queues, worker and signed tunnel with a simulated WhatsApp page. Its earlier local application round trip and Basic/Advanced configuration checks remain transport/fixture evidence. That suite does not send to real recipients and is excluded from CI.

`test:bridge` covers local transport, consent, optional permissions, retries, stable command records, failed configuration, route recovery and preservation of unrelated routes. Unit checks cover filter bounds, exclusion before queuing, scope, expiry, stable rejection and disconnect during a save.

`test:desk` opens the included application without an account and checks protected key input, disabled premature setup, language persistence, independent local/remote cookies and 320/390/1440 layouts without external requests or sends. Server tests exercise signed receiving, exact destination binding, request identity, access renewal, local-only/CSRF checks and duplicate handling.

`test:tutorials` checks both libraries and all sixteen articles: complete static content, local navigation, package downloads, image decoding, step checkpoints, receiving/sending diagrams, location tabs, keyboard controls, enlargement, equivalent-story language switching and mobile layout. External requests are blocked and analytics consent is rejected.

Rebuild with `npm run package:desk` and `npm run build:tutorials`. `capture:tutorials` regenerates the older explanatory fixture images and public login page; it does not regenerate `assets/smoke/` or substitute fixtures for the authenticated captures. Repeating the real smoke requires explicit WhatsApp authentication and a consenting test recipient. The three RELAYERS-only guides remain separate nontechnical introductions and do not inherit WhatsApp smoke claims.
