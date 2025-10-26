#!/usr/bin/env sh

# Mimic husky shim to ensure local binaries are on PATH when hooks run.
export PATH="$(dirname -- "$0")/../../node_modules/.bin:$PATH"
