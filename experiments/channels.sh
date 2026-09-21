#!/bin/sh
# Third-draft channels. 100k steps each, four at a time, about 12 minutes.
#  O_*  origin: no seed strand; does replication start from spontaneous links, and how fast?
#  X_*  radiation selection: tough B blocks (resB 0.9) are scarce (100 against 300 A). Does B rise? Control: no resistance.
#  M_*  metabolism selection: energy only from ABA motifs (pReload 0). Does the motif spread? Control: motif off, background reload.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --W 80 --H 80 --nE 300 --energyMode unit"
{
for seed in 31 32; do
  echo "O_spont3e4_$seed --seed $seed --nA 400 --nB 400 --seedCount 0 --pSpont 0.0003 --pCapture 0.02 --pFray 0.0001 --pSoft 0.01"
  echo "O_spont1e3_$seed --seed $seed --nA 400 --nB 400 --seedCount 0 --pSpont 0.001 --pCapture 0.02 --pFray 0.0001 --pSoft 0.01"
  echo "O_spont3e3_$seed --seed $seed --nA 400 --nB 400 --seedCount 0 --pSpont 0.003 --pCapture 0.02 --pFray 0.0001 --pSoft 0.01"
  echo "X_rad_$seed      --seed $seed --nA 300 --nB 100 --seedSeq ABBABA --pBreak 0.001 --resB 0.9 --pLigate 0.005 --pFray 0.0001 --pSoft 0.02 --pCapture 0.02"
  echo "X_ctrl_$seed     --seed $seed --nA 300 --nB 100 --seedSeq ABBABA --pBreak 0.001 --resB 0   --pLigate 0.005 --pFray 0.0001 --pSoft 0.02 --pCapture 0.02"
  echo "M_motif_$seed    --seed $seed --nA 400 --nB 400 --seedSeq ABBABA --motif 1 --pReload 0 --pFray 0.0001 --pSoft 0.02 --pCapture 0.02"
  echo "M_ctrl_$seed     --seed $seed --nA 400 --nB 400 --seedSeq ABBABA --motif 0 --pReload 0.002 --pFray 0.0001 --pSoft 0.02 --pCapture 0.02"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo CHANNELSDONE
