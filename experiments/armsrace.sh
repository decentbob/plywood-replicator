#!/bin/sh
# Keys and mimics (RESULTS.md, section 43). Translation needs a start letter (transStart D); a product carries its maker's key (the
# run of coded letters, code A->1, B->2) and, with graded specificity (pMisMelt), binds strongly only where the key recurs; a shared
# catalyst (bindAny) lets strands without the start (mimics) be copied on others' products. AR_*: open world, hosts DABBAB x6,
# 1,000,000 steps; controls without specificity (nospec) and without the start rule (nostart, everyone translates). CR_*: the capped
# world (endLoss, caps), hosts PDABBABQ, where a key cannot shrink, 2,000,000 steps. Read with experiments/keys.js and redqueen.js.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}
mkdir -p $O
B="--steps 1000000 --every 20000 --maxBirthLog 400000 --W 40 --H 40 --nA 150 --nB 150 --nC 150 --nD 150 --n1 150 --n2 150 --nE 100 --pUndock 0.1 --pFray 0.00003 --pUnzip 1 --pSoft 0.002 --translate 1 --transCode A1,B2 --catalysis 1 --bindAny 1 --pLinkBare 0.01 --seedSeq DABBAB --seedCount 6"
C="--steps 2000000 --every 20000 --maxBirthLog 400000 --W 40 --H 40 --nA 150 --nB 150 --nC 150 --nD 150 --nP 120 --nQ 120 --n1 150 --n2 150 --nE 100 --capFray 0.03 --pUnzip 1 --pFray 0.001 --pUndock 0.1 --endLoss 1 --seedSeq PDABBABQ --seedCount 6 --pSoft 0.002 --translate 1 --transCode A1,B2 --catalysis 1 --bindAny 1 --transStart D --pLinkBare 0.05"
{
for sd in 1 2; do
echo "AR_spec_$sd --seed $sd $B --transStart D --pMisMelt 0.05"
echo "AR_nospec_$sd --seed $sd $B --transStart D"
echo "AR_nostart_$sd --seed $sd $B --pMisMelt 0.05"
echo "CR_spec_$sd --seed $sd $C --pMisMelt 0.05"
echo "CR_nospec_$sd --seed $sd $C"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo ARMSRACEDONE
