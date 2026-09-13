#!/usr/bin/env bash
set -euo pipefail
exec rtk proxy python3 "${BASH_SOURCE[0]%/*}/agent_hooks.py" adr-check "$@"
