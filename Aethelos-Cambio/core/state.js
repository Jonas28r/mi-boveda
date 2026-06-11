export const state = {
  rates: {},
  lastUpdate: null,
  isOnline: navigator.onLine,
  premium: false,
  ads: {
    lastInterstitial: Number(localStorage.getItem("ad_time") || 0)
  }
};
