import { loadRates, saveRates } from "../utils/storage.js";

let forexRates = {
  USD: 1,
  EUR: 0,
  COP: 0,
  BS: 0
};

export async function fetchForex() {
  const localCache = loadRates();
  if (localCache) {
    forexRates = localCache;
    return forexRates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();

    forexRates = {
      USD: 1,
      EUR: data.rates.EUR,
      COP: data.rates.COP,
      BS: 45.5 // fallback estable
    };

    saveRates(forexRates);
    return forexRates;
  } catch (err) {
    console.log("Forex offline");
    return forexRates;
  }
}

export function getForexRates() {
  return forexRates;
}
