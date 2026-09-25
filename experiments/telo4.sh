#!/bin/sh
# Telomeres, round 5: can the shield gene arise from nothing? (RESULTS.md, section 33.) World of telo3.sh (bare caps) under
# both pressures, seeded only with PABAQ (the energy gene between caps). A CDC gene needs about three insertions (capture,
# chimeric copies) and point mutations, with every intermediate still carrying ABA. Normal and fivefold mutation.
# TD_rad5_*: radiation only (plentiful energy), where the population is about five times larger. TD_lig_*: the same with
# ligation, so broken pieces rejoin (end joining), the one channel here that changes a capped genome's length often.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-1000000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 600000 --W 40 --H 40 --nA 200 --nB 200 --nC 200 --nD 200 --nP 120 --nQ 120 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABAQ --nE 16 --pReload 0.0004 --pBreak 0.00003"
{
echo "TD_mut1_1 --seed 1 --pSoft 0.002 --pCapture 0.002"
echo "TD_mut5_1 --seed 1 --pSoft 0.01 --pCapture 0.01"
echo "TD_mut5_2 --seed 2 --pSoft 0.01 --pCapture 0.01"
echo "TD_rad5_1 --seed 1 --pSoft 0.01 --pCapture 0.01 --nE 60 --pReload 0.002"
echo "TD_rad5_2 --seed 2 --pSoft 0.01 --pCapture 0.01 --nE 60 --pReload 0.002"
echo "TD_lig_1 --seed 1 --pSoft 0.01 --pCapture 0.01 --nE 60 --pReload 0.002 --pLigate 0.05"
echo "TD_lig_2 --seed 2 --pSoft 0.01 --pCapture 0.01 --nE 60 --pReload 0.002 --pLigate 0.05"
echo "TF_dense_1 --seed 1 --pSoft 0.01 --pCapture 0.01 --nE 60 --pReload 0.002 --pLigate 0.05 --nA 400 --nB 400 --nC 400 --nD 400"
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TELO4DONE
