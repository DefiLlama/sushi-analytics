exit 0 # use cloudUpdate instead

npm update  @defillama/sdk @kamino-finance/kliquidity-sdk


git config --global user.email llama@llama.fi
git config --global user.name llama
git stash

[ ! -d "DefiLlama-Adapters" ] && git clone https://github.com/DefiLlama/DefiLlama-Adapters

cd DefiLlama-Adapters
git stash
git checkout main
git pull
npm i
npm update @defillama/sdk
git stash
