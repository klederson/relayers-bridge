#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Instale Node.js 22 ou superior / Install Node.js 22 or newer: https://nodejs.org/en/download'
  read -r desk_answer
  exit 1
fi
node server.mjs
