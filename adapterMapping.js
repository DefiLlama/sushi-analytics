module.exports = {
  hourlyRun: [
    [
      {
        'harvest': '/harvest.js',
        'hydradex': '/hydradex.js',
        'hydradex-v3': '/hydradex-v3/index.js',
        'injective-orderbook': '/injective-orderbook/api',
      },
      {
        'bifrost-staking': '/bifrost-staking/api',
        'bifrost-dex': '/bifrost-dex/api',
        'bifrost-liquid-crowdloan': '/bifrost-liquid-crowdloan/api',
      },
      {
        // 'genshiro': '/genshiro/api',
        // 'streamflow': '/streamflow/index',
      },
      {
        'interlay-btc': '/interlay-btc/api',
        'interlay-staking': '/interlay-staking/api',
        'interlay-collateral': '/interlay-collateral/api',
      },
    ],
    [
      {
        'parallel-staking': '/parallel-staking/api',
        'parallel-crowdloan': '/parallel-crowdloan/api',
        'parallelamm': '/parallelamm/api',
        'parallel-lending': '/parallel-lending/api',
        'parallel-stream': '/parallel-stream/api',
      },
      {
        'acala-staking': '/acala-staking/api',
        'acala-lcdot': '/acala-lcdot/api',
        'tapio': '/tapio/api',
        'acala-lending': '/acala-lending/api',
        'acala-dex': '/acala-dex/api',
      },
      {
        'karura-lending': '/karura-lending/api',
        'karura-staking': '/karura-staking/api',
        'taiga': '/taiga/api',
        'karura-dex': '/karura-dex/api',
      },
      {
        'kintsugi': '/kintsugi/api',
        'jewelswap-lev-farming': '/jewelswap-lev-farming/index',
        'jewelswap-nft': '/jewelswap-nft/index',

      },
    ],
  ],
  bulky: [
    [{
      // 'quantumx-network': '/quantumx-network/index',
      'stackswap': '/stackswap/api',
      'vitcswap': '/vitcswap/api',
      'defichain-loans': '/defichain-loans',
      'kamino': '/kamino/api',
      // '1inch': '/1inch/apiCache',
      'izumi': '/izumi/api',
      'summer-fi': '/summer-fi/index',
      'sunswap-v2': '/sunswap-v2/index',
      unicrypt: '/unicrypt/apiCache',
      deeplock: '/deeplock/apiCache',
      pinksale: '/pinksale/apiCache',
      'team-finance': '/team-finance/apiCache',
      synthetix: '/synthetix/apiCache',
      dxsale: '/dxsale/apiCache',
      'yodeswap': '/yodeswap/api',
      'dogeswap-org': '/dogeswap-org/api',

      // breaks often
      'equilibrium': '/equilibrium/api',
    }],
  ],
}