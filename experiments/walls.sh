#!/bin/sh
# Do walls pay? (RESULTS.md, section 24.) Energy only from the public ABA motif (charged particles cannot pass membrane).
# W_*: strands carrying BAB anchor membrane and grow walls around themselves (make + tether), walls let monomers through
# (memPerm). N_*: the same world with no membrane. Measure ABA and BAB per newborn block (motifs.js) and survival.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
C="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 30 --H 30 --nA 100 --nB 100 --nE 40 --seedSeq ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --motif 1 --pReload 0.00005 --snapCorners 1 --maxStrain 0.5"
{
for sd in 1 2 3; do
  echo "W_$sd --seed $sd --nM 250 --memAngle 15 --stiffM 0.7 --make 1 --tether 1 --memPerm 1 --pMemDecay 0.002"
  echo "N_$sd --seed $sd --nM 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
# round 2 (W2_*): walls that close reliably (rigid membrane, memLinkTol 0.3, closure.js); the N_* runs are the control
{
for sd in 1 2 3; do
  echo "W2_$sd --seed $sd --nM 250 --memAngle 15 --stiffM 1 --memLinkTol 0.3 --make 1 --tether 1 --memPerm 1 --pMemDecay 0.002"
done
echo "W2b_1 --seed 1 --nM 250 --memAngle 18 --stiffM 1 --memLinkTol 0.3 --make 1 --tether 1 --memPerm 1 --pMemDecay 0.002"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo WALLSDONE
