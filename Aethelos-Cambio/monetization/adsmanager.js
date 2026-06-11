import { load, save } from "../utils/storage.js";

const ADS_KEY = "aethelos_ads";
const PREMIUM_KEY = "aethelos_premium";

let adsState = load(ADS_KEY) || {
  lastInterstitial: 0,
  impressions: 0
};

export const AdsManager = {
  isPremium() {
    return load(PREMIUM_KEY) === true;
  },

  // ===== BANNER (NO INTRUSIVO) =====
  showBanner() {
    if (this.isPremium()) return;

    const banner = document.getElementById("banner-ad");
    if (!banner) return;

    banner.classList.remove("hidden");
    banner.innerHTML = `
      <div style="font-size:12px;opacity:.7">
        Publicidad discreta
      </div>
    `;
  },

  hideBanner() {
    const banner = document.getElementById("banner-ad");
    if (banner) banner.classList.add("hidden");
  },

  // ===== INTERSTITIAL (1 VEZ AL DÍA) =====
  canShowInterstitial() {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    return (now - adsState.lastInterstitial) > ONE_DAY;
  },

  showInterstitial() {
    if (this.isPremium()) return;
    if (!this.canShowInterstitial()) return;

    const overlay = document.createElement("div");
    overlay.style = `
      position:fixed;
      top:0;left:0;
      width:100%;height:100%;
      background:rgba(0,0,0,0.85);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
      color:white;
      font-family:system-ui;
      text-align:center;
      padding:20px;
    `;

    overlay.innerHTML = `
      <div>
        <h2>Publicidad</h2>
        <p>Gracias por usar Aethelos</p>
        <button id="closeAd" style="
          margin-top:20px;
          padding:10px 20px;
          background:#22c55e;
          border:none;
          border-radius:8px;
          cursor:pointer;
        ">Continuar</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeAd").onclick = () => {
      overlay.remove();
      
      // Guardamos el timestamp exacto del cierre del anuncio
      adsState.lastInterstitial = Date.now();
      adsState.impressions++;
      save(ADS_KEY, adsState);
    };
  },

  // ===== PREMIUM OCULTO =====
  enablePremium(secretCode) {
    if (secretCode === "AETHELOS_UNLOCK_2026") {
      save(PREMIUM_KEY, true);
      this.hideBanner();
      alert("Premium activado");
    }
  }
};
