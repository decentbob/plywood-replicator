#!/bin/sh
# Walls against rays (RESULTS.md, section 25). Rays (nX) are small slow blocks that break the bonds they touch and cannot pass
# membrane. Mobilities are set so that a closed ring keeps rays out and its strand in (ray_shield.js): bonded letters 0.6,
# membrane 0.5, rays 0.08, energy 0.2. R_W_*: strands carrying BAB grow tethered, permeable walls. R_N_*: no membrane.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
C="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 30 --H 30 --nA 100 --nB 100 --nE 40 --seedSeq ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --snapCorners 1 --maxStrain 0.5 --mobS 0.6 --mobM 0.5 --mobE 0.2 --nX 60 --mobX 0.08 --rayHit 0.0005"
{
for sd in 1 2 3; do
  echo "R_W_$sd --seed $sd --nM 250 --memAngle 15 --stiffM 1 --memLinkTol 0.3 --make 1 --tether 1 --memPerm 1 --pMemDecay 0.002"
  echo "R_N_$sd --seed $sd --nM 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo RAYSDONE
