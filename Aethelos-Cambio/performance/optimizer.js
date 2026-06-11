export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 500) {
  let last;
  return (...args) => {
    const now = Date.now();
    if (!last || now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}
