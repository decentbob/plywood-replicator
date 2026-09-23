#!/bin/sh
# Tethered membrane (RESULTS.md, section 24): rings holding strands under four membrane regimes, three seeds each, 150,000 steps.
# fixed: a stock of active membrane (no make); make: membrane activated at BAB backs (section 16's rule); tether: only arcs
# anchored on a maker recruit, unanchored membrane decays; tether+perm: the same, with membrane permeable to free monomers.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
T="15 SEED 150000 pUnzip=1,pUndock=0.1,pFray=0.00003,snapCorners=true,stiffM=0.7,maxStrain=0.5"
for sd in 1 2 3; do
  echo "fixed_$sd $(echo $T | sed s/SEED/$sd/),make=false,tether=false,memPerm=true,pMemDecay=0"
  echo "make_$sd $(echo $T | sed s/SEED/$sd/),tether=false,memPerm=true"
  echo "tether_$sd $(echo $T | sed s/SEED/$sd/),tether=true,memPerm=false"
  echo "tetherperm_$sd $(echo $T | sed s/SEED/$sd/),tether=true,memPerm=true"
done | xargs -P 4 -L 1 sh -c 'node experiments/tether_probe.js "$1" "$2" "$3" "$4" > '$O'/C_$0.txt'
echo CELLSDONE
