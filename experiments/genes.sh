#!/bin/sh
# Two genes in a four-letter world (RESULTS.md, section 19): ABA (feed: private energy) and CDC (shield: bonds immune to
# radiation). Both rules are always on; only the environment changes. Round 1 (G_*): none, scarce energy, radiation,
# both. Round 2 (G2_*): energy truly scarce, radiation a third as strong, two seeds each. Round 3 (G3_*): the relay on
# (one motif serves its whole strand), the four environments, two seeds each.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
C="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 128 --nB 128 --nC 128 --nD 128 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABABCD,CDCDAB --seedCount 1 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --feed 1 --shield 1"
run() { xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$1"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'; }
{
echo "G_none_1   --seed 1 --nE 60 --pReload 0.002"
echo "G_energy_1 --seed 1 --nE 26 --pReload 0.0005"
echo "G_rad_1    --seed 1 --nE 60 --pReload 0.002 --pBreak 0.0001"
echo "G_both_1   --seed 1 --nE 26 --pReload 0.0005 --pBreak 0.0001"
} | run "$C"
{
for sd in 1 2; do
echo "G2_energy_$sd --seed $sd"
echo "G2_both_$sd   --seed $sd --pBreak 0.00003"
done
} | run "$C --nE 12 --pReload 0.0003"
{
for sd in 1 2; do
echo "G3_none_$sd   --seed $sd --nE 60 --pReload 0.002"
echo "G3_energy_$sd --seed $sd --nE 12 --pReload 0.0003"
echo "G3_rad_$sd    --seed $sd --nE 60 --pReload 0.002 --pBreak 0.0001"
echo "G3_both_$sd   --seed $sd --nE 12 --pReload 0.0003 --pBreak 0.0001"
done
} | run "$C --relay 1"
echo GENESDONE
