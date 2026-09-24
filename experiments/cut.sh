#!/bin/sh
# Cutting by recognition (RESULTS.md, section 26). Binding (pHyb) lets two template faces of complementary letters stick; with
# cut on, a template unit in the motif BAB whose face is bound shows CUT, and its bound partner lets go of all its bonds at
# pCut. Kin never bind, so a cutter never cuts its own lineage (a bacteriocin). Polymers creep (mobS 0.3), so neighbours
# are competitors. CUT_*: cutting on; CTL_*: binding alone. BAB per newborn block is the measure.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
M="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pHyb 0.05 --mobS 0.3"
{
for sd in 1 2 3; do
  echo "CUT_$sd --seed $sd --cut 1 --pCut 0.05"
  echo "CTL_$sd --seed $sd --cut 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
# round 2 (CUT4_*, CTL4_*): four letters (A-B and C-D bind), cutter motif CAC; a cutter whose genome uses only A and C can never
# bind its own kind. Seeds: one A/C cutter strand and one mixed strand.
M4="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 128 --nB 128 --nC 128 --nD 128 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ACACCA,ABCDBA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pHyb 0.05 --mobS 0.3 --cutMotif CAC"
{
for sd in 1 2 3; do
  echo "CUT4_$sd --seed $sd --cut 1 --pCut 0.05"
  echo "CTL4_$sd --seed $sd --cut 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M4"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo CUTDONE
