let binancePrices = {
  BTC: 0,
  ETH: 0,
  SOL: 0
};

export function startBinanceFeed(onUpdate) {
  const symbols = ["btcusdt", "ethusdt", "solusdt"];

  symbols.forEach(symbol => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      const coin = symbol.replace("usdt", "").toUpperCase();

      binancePrices[coin] = price;

      onUpdate({
        coin,
        price
      });
    };
  });
}

export function getCryptoPrice(symbol) {
  return binancePrices[symbol] || 0;
}
