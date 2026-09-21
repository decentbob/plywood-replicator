#!/bin/sh
# Membrane blocks (type M): self-assembly into rings, enclosure of replicators, and whether compartments
# change what selection sees. 100k steps each, four at a time, about 12 minutes.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --W 80 --H 80 --nE 300 --memAngle 60 --memFlex 6 --pMem 0.2"
{
echo "MB_assembly_45  --seed 61 --nA 0 --nB 0 --nE 0 --nM 300 --seedCount 0 --memAngle 45"
echo "MB_assembly_60  --seed 61 --nA 0 --nB 0 --nE 0 --nM 300 --seedCount 0 --memAngle 60"
for seed in 61 62; do
  echo "MB_evo_$seed      --seed $seed --nA 400 --nB 400 --nM 300 --seedSeq ABBABA --pSoft 0.01 --pCapture 0.01 --pFray 0.0001 --pSpont 0.001 --pBreak 0.0002 --resM 0.7"
  echo "MB_motif_$seed    --seed $seed --nA 400 --nB 400 --nM 300 --seedSeq ABBABA --pSoft 0.01 --pCapture 0.01 --pFray 0.0001 --pSpont 0.001 --pBreak 0.0002 --resM 0.7 --motif 1 --pReload 0"
  echo "MB_motifctrl_$seed --seed $seed --nA 400 --nB 400 --nM 0 --seedSeq ABBABA --pSoft 0.01 --pCapture 0.01 --pFray 0.0001 --pSpont 0.001 --pBreak 0.0002 --motif 1 --pReload 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo MEMBRANESDONE
