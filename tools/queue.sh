#!/bin/sh
# A simple job queue for run.js on a shared machine: runs each line of a job file as a headless run, never more than MAX
# run.js processes at once (counting runs started by anything else too), and logs each start and the end.
#   tools/queue.sh jobs.txt [MAX=4]        (start it with nohup ... & to leave it running)
# Each job line: OUTDIR NAME --knob value ...   ->   node run.js ARGS --births OUTDIR/NAME.births.jsonl > OUTDIR/NAME.csv 2> OUTDIR/NAME.json
# Blank lines and lines starting with # are skipped. The log is jobs.txt.log. A job file may be appended to while it runs.
# The births file grows during a run (run.js flushes it every reporting interval); NAME.json is written when the run ends.
cd "$(dirname "$0")/.."
JOBS=$1; MAX=${2:-4}; LOG="$JOBS.log"
[ -f "$JOBS" ] || { echo "usage: tools/queue.sh jobs.txt [max]"; exit 2; }
while IFS= read -r line; do
  case "$line" in ''|'#'*) continue ;; esac
  while [ "$(pgrep -c -f '^node run.js')" -ge "$MAX" ]; do sleep 20; done
  set -- $line; out=$1; name=$2; shift 2
  mkdir -p "$out"
  nohup node run.js "$@" --births "$out/$name.births.jsonl" > "$out/$name.csv" 2> "$out/$name.json" &
  echo "$(date +%H:%M) started $name" >> "$LOG"
  sleep 2
done < "$JOBS"
wait
echo "$(date +%H:%M) ALLDONE" >> "$LOG"
