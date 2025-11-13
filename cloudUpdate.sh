pnpm update @kamino-finance/kliquidity-sdk


if [ -z "$(git config --global user.email)" ]; then
  git config --global user.email llama@llama.fi
fi
if [ -z "$(git config --global user.name)" ]; then
  git config --global user.name llama
fi

git stash

[ ! -d "DefiLlama-Adapters" ] && git clone https://github.com/DefiLlama/DefiLlama-Adapters

cd DefiLlama-Adapters
git checkout main
git pull
pnpm i

cd ..

pnpm run update-data