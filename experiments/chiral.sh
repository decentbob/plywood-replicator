#!/bin/sh
# Chirality (RESULTS.md, section 30). A racemic pool (chiral 0.5: half the letters are mirror forms, written lowercase), one
# strand of each hand as seeds, spontaneous origins of any hand. pMisDock: a monomer of the other hand docks at this fraction
# of the normal rate and poisons the site until it falls off (enantiomeric cross-inhibition); pMixLink: mixed neighbours link.
# Question: does one hand take over (symmetry breaking), and does cross-inhibition make it happen, faster than drift?
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
C="--steps 300000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA,abbaba --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --snapCorners 1 --maxStrain 0.5 --chiral 0.5"
# Round 2 (ROUND=2): Frank's conditions. Free monomers flip hand (pRacem 0.001), so both hands draw on one pool; mixed
# neighbours seldom link (pMixLink 0.001), so a mirror monomer docked in a site blocks it. With and without mirror docking.
{
if [ "${ROUND:-1}" = 1 ]; then
for sd in 1 2; do
  echo "CH_mis0_$sd --seed $sd --pMisDock 0"
  echo "CH_mis03_$sd --seed $sd --pMisDock 0.3"
  echo "CH_mis1_$sd --seed $sd --pMisDock 1"
done
else
for sd in 1 2; do
  echo "CH2_frank_$sd --seed $sd --pRacem 0.001 --pMixLink 0.001 --pMisDock 0.3"
  echo "CH2_pool_$sd --seed $sd --pRacem 0.001 --pMixLink 0.001 --pMisDock 0"
done
fi
} | xargs -P ${P:-3} -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo CHDONE
