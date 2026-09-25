#!/bin/sh
# Emergent fit for products (RESULTS.md, section 34): does a product's shape change how well it catalyses? Translation +
# catalysis (pLinkBare 0.01), two letters, genome ABBABA (product 122121). Product kind 1 folds by fold1 degrees while its
# face is free (straight while bound). A folded product must straighten to bind back, so fold may slow binding: shape as
# a graded function of sequence. 80,000 steps; births and products per run.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-80000}
mkdir -p $O
C="--steps $STEPS --every 10000 --maxBirthLog 200000 --W 40 --H 40 --nA 200 --nB 200 --n1 200 --n2 200 --nE 100 --seedSeq ABBABA --seedCount 3 --pUndock 0.1 --pFray 0.00003 --pUnzip 1 --translate 1 --catalysis 1 --pLinkBare 0.01 --snapCorners 1"
{
for sd in 1 2; do for f in 0 30 45 60; do echo "PS_f${f}_$sd --seed $sd --fold1 $f"; done; done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo PSDONE
