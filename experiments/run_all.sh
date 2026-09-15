#!/bin/sh
# Runs every experiment batch in turn (about 35 minutes on 4 cores), then prints the summary tables.
cd "$(dirname "$0")/.."
./experiments/cooperativity.sh
./experiments/competition.sh
./experiments/regimes.sh
./experiments/length_selection.sh
echo ALLBATCHES
