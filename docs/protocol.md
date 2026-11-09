# Browser bridge protocol

This describes the public extension's contract. It does not include a server implementation, deployment configuration or internal platform plan.

## Setup and transport

The user explicitly grants access to their chosen HTTPS RELAYERS API origin (plain HTTP is limited to local development), approves the device authorization code, chooses a regular WhatsApp tab and up to 50 loaded conversations, then opts into IN and/or OUT. No private-browsing relay is enabled.

Creating a connection provisions dedicated HMAC-SHA256 webhook endpoints for the selected directions. IN and OUT use independent signing secrets. The outgoing rule targets the registered browser daemon explicitly. The browser subscribes to that endpoint over the existing authenticated, signed WebSocket tunnel. API credentials are kept in trusted local extension storage, not in WhatsApp's page context.

The tunnel uses `/v1/tunnel/connect`, device authorization uses `/v1/auth/device/code` and `/v1/auth/device/token`, and webhook input uses `/v1/webhooks/{public_id}`. JSON API responses use the `data`/`error` envelope. Capability and deployment compatibility must be checked against the actual server; local fixtures do not establish production compatibility.

The extension never fetches the destination URL supplied with a tunnel delivery. It accepts only its sentinel `https://whatsapp.bridge.invalid/send`, a POST, and the configured OUT endpoint. It parses and validates a typed command, not an executable script. The `.invalid` address is a protocol marker, not a real service.

## IN

After creating a baseline of the selected loaded conversations, newly observed incoming messages create events with:

- `schema`: `relayers.whatsapp.v1`
- `type`: `message.received`
- `eventId`: durable UUID, also sent as `X-Idempotency-Key`
- `connectionId`, `accountId`, `chatId`, `messageId`
- `timestamp`: milliseconds since the Unix epoch
- `direction`: `in`; `origin`: `whatsapp`
- `messageType`, `text`, `truncated`

Only selected conversations are scanned. Outgoing messages and system notifications are excluded to prevent echo. Text/captions are bounded to 16,384 characters and truncation is explicit. Media files, media keys and view-once content are not downloaded or forwarded. No historical archive is fetched. Polling observes available loaded messages; it cannot guarantee observing messages that WhatsApp never exposes or removes between scans.

The event and its observed-message marker are persisted together before sending. A retry retains its event identity and payload. A successful platform ingestion receipt removes queued content but leaves a bounded deduplication marker. This is not proof of delivery to downstream destinations. The platform's own persistence/deduplication/route semantics also matter; exactly-once end-to-end delivery is not claimed.

The default pending limit is 500 events or 2 MiB of payload data, and the marker limit is 10,000. Pending content older than 24 hours is removed on the extension's next cleanup run; expiry pauses the connection and is surfaced rather than reporting delivery. Full queues stop adding new input while queued delivery continues; unrecorded events are not acknowledged as captured. Queue-pressure details remain visible. Availability of uncaptured messages still depends on WhatsApp keeping them loaded.

## OUT

An external caller signs the exact UTF-8 JSON request body with the OUT endpoint’s secret using HMAC-SHA256 and passes the hex signature in `X-Relayers-Signature`. Reveal this secret explicitly in Integration details; it is not included in the normal status response. Keep the IN secret separate. A webhook ingestion receipt acknowledges the platform input, not message delivery.

The authenticated delivery body must contain:

```json
{
  "schema": "relayers.whatsapp.v1",
  "type": "message.send",
  "commandId": "<stable UUID for this intended message>",
  "connectionId": "<configured connection UUID>",
  "accountId": "<configured WhatsApp account identifier>",
  "chatId": "<one explicitly selected conversation identifier>",
  "text": "Your deliberate outgoing message",
  "expiresAt": "<future ISO timestamp, at most 24 hours away>"
}
```

Integration details in the connection page show the real connection values and an expiring example. A new intended message requires a fresh `commandId`. Retrying the same intended message must preserve its command identity and content, including expiry. Reusing the ID with changed effect fields is rejected. If transformations generate command identities, derive them deterministically from the original source event; never generate a new identity on each delivery attempt.

The persistent journal records an intent before dispatch and stores a fingerprint rather than the outgoing text. Duplicate commands return the recorded result. A restart with an unfinished intent is uncertain and does not repeat the send. The maximum journal size is 4,096 entries; expired entries are pruned on subsequent command processing. Expired commands cannot dispatch again even if their records have been pruned.

Result bodies distinguish `accepted`, `rejected` and `uncertain`. A `deliver_resp` with HTTP-equivalent 200/202 means the browser handled the transport request; its JSON body determines the message result. In particular, 202/uncertain must never be presented as recipient delivery. There are no delivery/read receipts in this initial integration. The platform UI may need dedicated rendering of these result bodies; currently they remain available as delivery-response details.

Immediately before sending, the extension checks enabled direction, scope, expiry, permission and actual WhatsApp account. It invokes the existing native adapter with the account and document identity. No focus change, chat opening, composer change, navigation or reload is used for a background send. Failure preserves the existing session. An effect already in progress may finish after a pause request.

## Pause, resume and disconnect

Pause stops new transport work and retains local pending data. Resume continues pending input and newly observed messages, without backfilling the paused interval. Browser shutdown, session disconnection and unsupported WhatsApp internals affect availability.

Disconnect requires explicit confirmation. It stops transport, waits for outstanding local operations, removes local credentials/queue/journal and revokes the server-origin grant. It does not delete server endpoints, queued server work, data already forwarded or provider-side records. Old commands are invalid for any newly created connection identity.

## WhatsApp configuration (extension 0.2.0)

The private connection page can create or update the receiving application route belonging to its own IN endpoint. Online applications use a public HTTPS destination. Local applications use a loopback address and a daemon selected from the authenticated account, excluding the Bridge's own daemon. The client does not fetch these user-supplied destinations; RELAYERS performs forwarding. Updating uses PATCH on the managed IN rule, and removing that application forwarding removes only that rule. OUT remains bound to this browser.

Both directions support bounded data-only filters. Basic mode matches any of up to ten comma-separated text phrases. Advanced mode combines up to ten conditions with all/any semantics: text contains/does-not-contain/equals/starts-with, conversation equality, and incoming message-kind equality. Text matching ignores case and combining accents. Empty conditions allow all messages within the already authorized scope. No filter expands account/conversation permissions or executes expressions, scripts or regular expressions.

IN filtering happens before queue capture; excluded message identities are marked as observed without retaining their content, so changing a filter does not backfill that history. Previously queued authorized content retains its original authorization. OUT filtering happens before dispatch and its definitive rejection is journaled; retrying that same command cannot turn into a send after a filter change.

Saving configuration stops transport, waits for current work and persists a pending marker before the platform update. A failed or interrupted save leaves the connection paused and blocks Resume until configuration is saved successfully. The in-flight-operation and disconnect rules above still apply. Filter previews evaluate only the entered example as text in the first authorized conversation and neither read chats nor send.
