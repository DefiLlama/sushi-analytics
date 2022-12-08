module.exports = {
  hourlyRun: [
    [
      {
        'harvest': '/harvest.js',
        'hydradex': '/hydradex.js',
        'injective-orderbook': '/injective-orderbook/api',
      },
      {
        'bifrost-staking': '/bifrost-staking/api',
        'bifrost-dex': '/bifrost-dex/api',
        'bifrost-liquid-crowdloan': '/bifrost-liquid-crowdloan/api',
      },
      {
        'genshiro': '/genshiro/api',
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
      },
    ],
    [{
      'sushiswap': '/sushiswap/api',
    }],
  ],
  bulky: {
    // 'kamino': '/kamino/api',
    unicrypt: '/unicrypt/apiCache',
    dxsale: '/dxsale/apiCache',
    dexpad: '/dexpad/apiCache',
    deeplock: '/deeplock/apiCache',
    pinksale: '/pinksale/apiCache',
    'team-finance': '/team-finance/apiCache',
    synthetix: '/synthetix/apiCache',
    '1inch': '/1inch/apiCache',
    'dogeswap-org': '/dogeswap-org/api',
  },
}