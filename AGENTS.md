# Working rules

This public repository contains RELAYERS Bridge and code reused from the public MIT-licensed TabHero project. Never copy private RELAYERS backend sources, internal plans, credentials, customer conversations or machine-specific configuration into it. The internal plan stays outside this repository.

Derive acceptance criteria from the actual use case. Preserve the existing WhatsApp document, URL, session, active chat, composer and focus. Never navigate/reload it as a fallback. Distinguish simulated tests from authenticated validation.

IN and OUT require separate, explicit opt-in and binding to the selected account and conversations. Server-driven sending must have a stable command identity, persistent intent/result journal, expiry, and no blind retry after uncertainty. Do not claim exactly-once delivery or recipient delivery from local acceptance. No arbitrary remote scripts.

Disclose actual RELAYERS transmission and local durable queues. Never reuse TabHero's no-relay claim for enabled Bridge connections. Preserve upstream MIT attribution. English is primary; inherited translations must remain complete.

Only at final handoff, end with a short spoken Portuguese line starting with 🔊, at most 220 characters, without paths, hashes, identifiers or links. Do not use it in progress updates.
