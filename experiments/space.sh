#!/bin/sh
# Space and the public motif (RESULTS.md, section 17): motif energy only, 80x80 against 40x40 at the same density.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
M="--steps 1000000 --every 20000 --maxBirthLog 300000 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --mobE 0.2 --seedSeq ABBABA --motif 1 --pReload 0.00005"
{
echo "SP80_motif_1 --seed 1 --W 80 --H 80 --nA 704 --nB 704 --nE 192 --seedCount 8"
echo "SP80_motif_2 --seed 2 --W 80 --H 80 --nA 704 --nB 704 --nE 192 --seedCount 8"
echo "SP_small_motif --seed 1 --W 40 --H 40 --nA 176 --nB 176 --nE 48 --seedCount 2"
echo "SP_small_motif_2 --seed 2 --W 40 --H 40 --nA 176 --nB 176 --nE 48 --seedCount 2"
echo "SP_small_motif_3 --seed 3 --W 40 --H 40 --nA 176 --nB 176 --nE 48 --seedCount 2"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo SPACE2DONE
