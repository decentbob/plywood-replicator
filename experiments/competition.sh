#!/bin/sh
# Direct fitness measurement: a dimer (AB) and a 6-mer (ABBABA) start together, mutation off, and we
# count births per species. Varies energy mode, energy supply and fraying. About 3 minutes per run.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --nA 400 --nB 400 --W 80 --H 80 --seedSeq AB,ABBABA --seedCount 3 --sigma 0.3 --sigmaRot 0.45 --pSoft 0 --pCapture 0 --pLigate 0"
{
for seed in 21 22; do
  echo "C_unit_E300_fray0_$seed    --seed $seed --nE 300   --pFray 0"
  echo "C_strand_E300_fray0_$seed  --seed $seed --nE 300 --pFray 0"
  echo "C_unit_E10_fray0_$seed     --seed $seed --nE 10 --pReload 0.0005   --pFray 0"
  echo "C_strand_E10_fray0_$seed   --seed $seed --nE 10 --pReload 0.0005 --pFray 0"
  echo "C_unit_E300_fray3_$seed    --seed $seed --nE 300   --pFray 0.0003"
  echo "C_strand_E10_fray3_$seed   --seed $seed --nE 10 --pReload 0.0005 --pFray 0.0003"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo ALLDONE
