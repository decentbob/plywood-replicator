#!/bin/sh
# Kill node processes whose command line matches a pattern, safely: only command lines that start with "node", so the shell
# running this (whose own command line contains the pattern) is never matched. Usage: tools/killnode.sh speed2.js
[ -n "$1" ] || { echo "usage: tools/killnode.sh PATTERN"; exit 2; }
for p in $(pgrep -f "^node .*$1"); do kill "$p" && echo "killed $p"; done
