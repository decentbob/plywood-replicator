#!/bin/sh
# Ecology in space (RESULTS.md, section 42): the shared catalyst of section 36 (code A->1: a product is made along runs of A;
# bindAny: a finished product binds the back of any armed letter) in an 80x80 world, four times section 36's, with polymers that
# creep (mobS 0.1, 0.3) against well mixed (1). HP_*: hosts BAAAAB and parasites BCDDCB seeded, 12 of each. HM_*: only hosts
# seeded, mutation 0.005, so strands that make no product have to arise. Measured from birth positions (experiments/spatial.js)
# and pictures of the saved states (experiments/hostmap.js).
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}
mkdir -p $O
C="--steps 300000 --every 10000 --maxBirthLog 400000 --W 80 --H 80 --nA 600 --nB 600 --nC 600 --nD 600 --n1 1200 --nE 400 --pUndock 0.1 --pFray 0.00003 --pUnzip 1 --translate 1 --transCode A1 --catalysis 1 --pLinkBare 0.01 --bindAny 1"
{
for sd in 1 2; do
echo "HP_slow_$sd --seed $sd --mobS 0.1 $C --seedSeq BAAAAB,BCDDCB --seedCount 12 --pSoft 0.002"
echo "HP_mix_$sd --seed $sd $C --seedSeq BAAAAB,BCDDCB --seedCount 12 --pSoft 0.002"
echo "HP_mid_$sd --seed $sd --mobS 0.3 $C --seedSeq BAAAAB,BCDDCB --seedCount 12 --pSoft 0.002"
echo "HM_slow_$sd --seed $sd --mobS 0.1 $C --seedSeq BAAAAB --seedCount 24 --pSoft 0.005"
echo "HM_mix_$sd --seed $sd $C --seedSeq BAAAAB --seedCount 24 --pSoft 0.005"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js "$@" --births '$O'/$name.births.jsonl --save '$O'/$name.state.json > '$O'/$name.csv 2> '$O'/$name.json'
echo HOSTPARASITEDONE
