export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function saveRates(rates) {
  localStorage.setItem("aethelos_rates", JSON.stringify({
    data: rates,
    time: Date.now()
  }));
}

export function loadRates() {
  const raw = localStorage.getItem("aethelos_rates");
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  const ONE_MIN = 60 * 1000; // cache válido por 1 minuto

  if (Date.now() - parsed.time < ONE_MIN) {
    return parsed.data;
  }
  return null;
}
