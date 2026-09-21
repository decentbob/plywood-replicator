#!/bin/sh
# Choosing the few presets worth keeping. 100k steps, 80x80, four at a time.
#  E_*   candidate open "evolution" regimes without membranes
#  P_*   membranes with larger rings (do rings enclose strands?) and the protocell regime (motif energy)
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --W 80 --H 80 --nE 300 --seedSeq ABBABA --slack 0.1 --pSoft 0.01 --pCapture 0.01 --pSpont 0.001 --pLigate 0.02"
{
echo "E_rad3      --seed 71 --nA 600 --nB 200 --pBreak 0.0003 --resB 0.9"
echo "E_rad3_und  --seed 71 --nA 600 --nB 200 --pBreak 0.0003 --resB 0.9 --pUndock 0.05"
echo "E_rad1      --seed 71 --nA 600 --nB 200 --pBreak 0.0001 --resB 0.9"
echo "E_fray      --seed 71 --nA 600 --nB 200 --pFray 0.0001"
echo "P_ring30    --seed 71 --nA 600 --nB 200 --pBreak 0.0002 --resB 0.9 --nM 300 --memAngle 30 --memFlex 6 --resM 0.7"
echo "P_ring225   --seed 71 --nA 600 --nB 200 --pBreak 0.0002 --resB 0.9 --nM 400 --memAngle 22.5 --memFlex 6 --resM 0.7"
echo "P_proto30   --seed 71 --nA 600 --nB 200 --pBreak 0.0002 --resB 0.9 --nM 300 --memAngle 30 --memFlex 6 --resM 0.7 --motif 1 --pReload 0.0005"
echo "P_proto30c  --seed 71 --nA 600 --nB 200 --pBreak 0.0002 --resB 0.9 --nM 0 --motif 1 --pReload 0.0005"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo PRESETSDONE
