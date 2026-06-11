import { startBinanceFeed } from "./data/binance.js";
import { fetchForex } from "./data/forex.js";
import { renderUI } from "./ui/render.js";
import { state } from "./core/state.js";
import { AdsManager } from "./monetization/adsmanager.js";
import { debounce } from "./performance/optimizer.js";

// ELEMENTOS UI
const el = {
  amount: document.getElementById("amount"),
  from: document.getElementById("from"),
  to: document.getElementById("to"),
  result: document.getElementById("result"),
  rate: document.getElementById("rate"),
  fee: document.getElementById("fee"),
  time: document.getElementById("time")
};

// INPUTS STATE
const inputs = {
  amount: 100,
  from: "USD",
  to: "BS"
};

// UPDATE ORQUESTRADOR
function update() {
  renderUI(el, state, inputs);
  
  // Ejecuta la validación de tiempo. Si no han pasado 24h, el AdsManager lo ignora en microsegundos sin consumir CPU.
  AdsManager.showInterstitial();
}

// EVENTS CON OPTIMIZACIÓN DE INPUT
el.amount.addEventListener("input",
  debounce(() => {
    inputs.amount = parseFloat(el.amount.value || 0);
    update();
  }, 200)
);

el.from.addEventListener("change", () => {
  inputs.from = el.from.value;
  update();
});

el.to.addEventListener("change", () => {
  inputs.to = el.to.value;
  update();
});

// SWAP INTERRUPTOR
document.getElementById("swap").onclick = () => {
  const temp = el.from.value;
  el.from.value = el.to.value;
  el.to.value = temp;
  
  inputs.from = el.from.value;
  inputs.to = el.to.value;
  update();
};

// DETECTOR DE OFFLINE INTELIGENTE
function setOnlineStatus() {
  const dot = document.getElementById("dot");
  const offline = document.getElementById("offline");

  state.isOnline = navigator.onLine;

  if (navigator.onLine) {
    dot.classList.add("online");
    offline.classList.add("hidden");
    initForex();
  } else {
    dot.classList.remove("online");
    offline.classList.remove("hidden");
  }
}

window.addEventListener("online", setOnlineStatus);
window.addEventListener("offline", setOnlineStatus);

// FOREX INIT
async function initForex() {
  await fetchForex();
  update();
}

// AUTO-UPDATE PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((reg) => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            console.log("Nueva versión disponible");
          }
        }
      };
    };
  });
}

// INIT TOTAL DE APLICACIÓN
function init() {
  setOnlineStatus();
  AdsManager.showBanner();
  
  // Hook disponible para uso futuro en consola o panel de administración
  window.enablePremiumApp = (code) => AdsManager.enablePremium(code);

  startBinanceFeed(() => {
    update();
  });
}

init();
