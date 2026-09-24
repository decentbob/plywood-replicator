#!/bin/sh
# Droplets (coacervates) and the public motif (RESULTS.md, section 31). The world of viscous.sh (section 21: public ABA motif as
# the only real energy income, slow energy), plus 300 droplet blocks (G) that attract each other and separate into liquid
# droplets; strand letters are drawn to G at 0.6 and free letters at 0.3 of that, so strands gather in droplets with their
# monomers. D_ctl_*: droplets, motif off, background reload. Compare with SP_small_motif_* and V_* (section 21).
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
M="--steps 600000 --every 20000 --maxBirthLog 300000 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --mobE 0.2 --seedSeq ABBABA --W 40 --H 40 --nA 176 --nB 176 --nE 48 --seedCount 2 --nG 300 --gStick 1 --gRange 2.2 --gStickS 0.6 --gStickF 0.3"
{
for sd in 1 2 3; do
  echo "D_motif_$sd --seed $sd --motif 1 --pReload 0.00005"
done
echo "D_ctl_1 --seed 1 --motif 0 --pReload 0.0003"
} | xargs -P ${P:-4} -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo DROPDONE
