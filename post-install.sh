npm update  @defillama/sdk @hubbleprotocol/kamino-sdk

[ ! -d "DefiLlama-Adapters" ] && git clone https://github.com/DefiLlama/DefiLlama-Adapters

cd DefiLlama-Adapters
git stash
git checkout main
git pull
npm i
npm update @defillama/sdk
