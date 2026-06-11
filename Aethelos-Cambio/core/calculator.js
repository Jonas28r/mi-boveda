import { getCryptoPrice } from "../data/binance.js";
import { getForexRates } from "../data/forex.js";

const COMMISSIONS = {
  BS: 0.015,
  COP: 0.01,
  BTC: 0.02,
  USDT: 0.005,
  USD: 0,
  EUR: 0.01
};

export function convert(amount, from, to) {
  const forex = getForexRates();

  // Mapeamos los rates invirtiendo las cryptos (1 / precio_en_usd) para normalizar base USD
  const btcPrice = getCryptoPrice("BTC");
  const ethPrice = getCryptoPrice("ETH");
  const solPrice = getCryptoPrice("SOL");

  const rates = {
    ...forex,
    USDT: 1, // Paridad directa fija
    BTC: btcPrice > 0 ? 1 / btcPrice : 0.00002,
    ETH: ethPrice > 0 ? 1 / ethPrice : 0,
    SOL: solPrice > 0 ? 1 / solPrice : 0
  };

  const usd = amount / (rates[from] || 1);
  let result = usd * (rates[to] || 1);

  const fee = COMMISSIONS[to] || 0;
  result = result * (1 - fee);

  return {
    value: result,
    rate: rates,
    fee
  };
}
