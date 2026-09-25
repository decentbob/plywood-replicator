#!/bin/sh
# Shared catalyst and parasites (RESULTS.md, section 36). Translation + catalysis with bindAny: a finished product binds the back
# of any armed letter. Code A->1, B->2 only, so C and D make no product: a strand of C/D is copied with other strands'
# products and makes none (a parasite). Seeds ABBABA (cooperator) and CDDCDC (parasite), three each. PA_mix: ordinary
# mobility; PA_slow: slow polymers (mobS 0.3), so products stay near their makers; PA_kin: products bind only strands they
# match (no bindAny), so parasites get nothing. 100,000 steps, two seeds.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-100000}
mkdir -p $O
C="--steps $STEPS --every 10000 --maxBirthLog 300000 --W 40 --H 40 --nA 150 --nB 150 --nC 150 --nD 150 --n1 200 --n2 200 --nE 100 --seedSeq ABBABA,CDDCDC --seedCount 3 --pUndock 0.1 --pFray 0.00003 --pUnzip 1 --pSoft 0.002 --translate 1 --transCode A1,B2 --catalysis 1 --pLinkBare 0.01"
{
for sd in 1 2; do
echo "PA_mix_$sd --seed $sd --bindAny 1"
echo "PA_slow_$sd --seed $sd --bindAny 1 --mobS 0.3"
echo "PA_kin_$sd --seed $sd"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo PADONE
