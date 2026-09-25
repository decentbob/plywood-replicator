#!/bin/sh
# Parasites on shared letters, and graded specificity (RESULTS.md, section 36). Code A->1 only (a product is made along runs of
# A); cooperators BAAAAB, parasites BCDDCB, three each. PY_*: shared catalyst (bindAny) against private (kin), mixed and slow;
# PG_*: shared catalyst whose mismatched bound units let go at pMisMelt (0.05, 0.2): graded specificity.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}
mkdir -p $O
C="--every 10000 --maxBirthLog 300000 --W 40 --H 40 --nA 150 --nB 150 --nC 150 --nD 150 --n1 300 --nE 100 --seedSeq BAAAAB,BCDDCB --seedCount 3 --pUndock 0.1 --pFray 0.00003 --pUnzip 1 --pSoft 0.002 --translate 1 --transCode A1 --catalysis 1 --pLinkBare 0.01"
{
echo "PY_mix_1 --steps 150000 --bindAny 1 --seed 1"
echo "PY_kin_1 --steps 150000 --seed 1"
echo "PY_mix_2 --steps 150000 --bindAny 1 --seed 2"
echo "PY_slow_1 --steps 150000 --bindAny 1 --mobS 0.3 --seed 1"
for sd in 1 2; do
echo "PG_mis05_$sd --steps 200000 --bindAny 1 --pMisMelt 0.05 --seed $sd"
echo "PG_mis2_$sd --steps 200000 --bindAny 1 --pMisMelt 0.2 --seed $sd"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
