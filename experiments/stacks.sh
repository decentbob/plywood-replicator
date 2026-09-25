#!/bin/sh
# Stacks, a second way to copy (RESULTS.md, section 40). Two-faced letters: an armed letter's back templates too, and with
# the stack rule a finished back copy stays on as a new row. Does a replicator that grows in stacks make length pay, or keep a
# two-gene genome that its fragments out-copy (section 22)? Names as in experiments/out: ST_<arm>_<seed>.
#   open world: two letters, 256 each, seeded ABBABAAB x3, cooperative docking 0.05, processive fraying 0.0003, mutation 0.002
#   arms: plain; back copies released (back); stacks with stacked bottoms held (hold, stackHold 1) at zip rates 0 to 0.05 with a
#   nucleation barrier (pSNuc 0); stacks that treadmill (tread, stackHold 0: a stack's bottom row frays) at zip 0 to 0.5; and
#   treadmilling stacks without the barrier (treadagg: any two strands that share a run in register bind face to back).
#   keep: the four-letter world of keep.sh (ABACDC, feed, shield, relay), mild and no pressure, plain against stacks (hold, 0.02).
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}
mkdir -p $O
A="--every 5000 --maxBirthLog 400000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --seedSeq ABBABAAB --seedCount 3 --pUndock 0.05 --pSoft 0.002 --pCapture 0.002 --pFray 0.0003 --pUnzip 1"
S="--backCopy 1 --stack 1"
K="--steps 200000 --every 10000 --maxBirthLog 400000 --W 40 --H 40 --nA 128 --nB 128 --nC 128 --nD 128 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABACDC --seedCount 3 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --feed 1 --shield 1 --relay 1"
{
for sd in 1 2; do
echo "ST_plain_$sd --seed $sd --steps 100000 $A"
echo "ST_back_$sd --seed $sd --steps 60000 $A --backCopy 1"
echo "ST_hold_z0_$sd --seed $sd --steps 100000 $A $S --stackHold 1"
for z in 0.002 0.005 0.02 0.03 0.05; do echo "ST_hold_z${z}_$sd --seed $sd --steps 60000 $A $S --stackHold 1 --pSNuc 0 --pSBind $z"; done
echo "ST_tread_z0_$sd --seed $sd --steps 60000 $A $S"
for z in 0.02 0.1 0.5; do echo "ST_tread_z${z}_$sd --seed $sd --steps 60000 $A $S --pSNuc 0 --pSBind $z"; done
echo "ST_treadagg_z0.5_$sd --seed $sd --steps 60000 $A $S --pSBind 0.5"
echo "ST_Kmild_plain_$sd --seed $sd $K --nE 16 --pReload 0.0004 --pBreak 0.00003"
echo "ST_Kmild_stk_$sd --seed $sd $K --nE 16 --pReload 0.0004 --pBreak 0.00003 $S --stackHold 1 --pSNuc 0 --pSBind 0.02"
echo "ST_Knone_plain_$sd --seed $sd $K --nE 60 --pReload 0.002"
echo "ST_Knone_stk_$sd --seed $sd $K --nE 60 --pReload 0.002 $S --stackHold 1 --pSNuc 0 --pSBind 0.02"
for b in 0.00003 0.0001 0.0003; do echo "ST_radplain_b${b}_$sd --seed $sd --steps 60000 $A --pBreak $b"; echo "ST_radtread1_b${b}_$sd --seed $sd --steps 60000 $A $S --pSNuc 0 --pSBind 0.1 --pBreak $b"; echo "ST_radtread5_b${b}_$sd --seed $sd --steps 60000 $A $S --pSNuc 0 --pSBind 0.5 --pBreak $b"; done
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js "$@" --births '$O'/$name.births.jsonl --save '$O'/$name.state.json > '$O'/$name.csv 2> '$O'/$name.json'
echo STACKSDONE
