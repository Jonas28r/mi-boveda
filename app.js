// Configuración base de tasas (Se usa como fallback offline inmediato)
let exchangeRates = {
    USD: 1,
    USDT: 1,
    BS: 45.50,   // Tasa referencial Bs
    COP: 3950,   // Tasa referencial COP
    EUR: 0.92,
    BTC: 0.000015 // Simulado respecto a 1 USD
};

const COMMISSIONS = {
    BS: 0.015,   // 1.5% comisión para operaciones en Bs
    COP: 0.01,   // 1.0% para COP
    BTC: 0.02,   // 2.0% para Crypto
    USDT: 0.005, // 0.5%
    USD: 0.0,
    EUR: 0.01
};

// Inicialización de elementos UI
const amountInput = document.getElementById('amount-input');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultOutput = document.getElementById('result-output');
const baseRateText = document.getElementById('base-rate-text');
const commissionText = document.getElementById('commission-text');
const lastUpdateText = document.getElementById('last-update');
const offlineBadge = document.getElementById('offline-badge');
const onlineIndicator = document.getElementById('online-indicator');
const swapBtn = document.getElementById('swap-btn');
const historyContainer = document.getElementById('history-container');

// Detectar estado de conexión
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBadge.classList.add('hidden');
        onlineIndicator.classList.remove('bg-zinc-600');
        onlineIndicator.classList.add('bg-emerald-500');
        fetchFreshRates();
    } else {
        offlineBadge.classList.remove('hidden');
        onlineIndicator.classList.remove('bg-emerald-500');
        onlineIndicator.classList.add('bg-zinc-600');
        loadRatesFromStorage();
    }
}

// Carga local instantánea (Modo Offline)
function loadRatesFromStorage() {
    const localRates = localStorage.getItem('aethelos_rates');
    const localTime = localStorage.getItem('aethelos_rates_time');
    if (localRates) {
        exchangeRates = JSON.parse(localRates);
        lastUpdateText.innerText = (localTime || 'Modo Offline') + ' (Caché)';
    }
    calculateConversion();
}

// Guardar datos localmente
function saveRatesToStorage() {
    localStorage.setItem('aethelos_rates', JSON.stringify(exchangeRates));
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('aethelos_rates_time', now);
    lastUpdateText.innerText = now;
}

// Fetch simulado / API (Aquí conectarás tu endpoint unificado luego)
async function fetchFreshRates() {
    try {
        // Simulación de red rápida. Cuando tengas la API, reemplazas esta lógica.
        saveRatesToStorage();
        calculateConversion();
    } catch (e) {
        loadRatesFromStorage();
    }
}

// El Motor Matemático del MVP
function calculateConversion() {
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (amount === 0) {
        resultOutput.innerText = "0.00";
        return;
    }

    // Convertir a base común (USD)
    const amountInUSD = amount / exchangeRates[from];
    
    // Convertir de USD a moneda destino
    let rawResult = amountInUSD * exchangeRates[to];

    // Aplicar comisión real según moneda de destino
    const commissionRate = COMMISSIONS[to] || 0;
    const finalResult = rawResult * (1 - commissionRate);

    // Formatear salida inteligentemente
    resultOutput.innerText = to === 'BTC' ? finalResult.toFixed(6) : finalResult.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Actualizar metadatos en pantalla
    const dynamicRate = (exchangeRates[to] / exchangeRates[from]);
    baseRateText.innerText = `1 ${from} = ${dynamicRate.toFixed(2)} ${to}`;
    commissionText.innerText = `${(commissionRate * 100).toFixed(1)}%`;
}

// Guardar historial en LocalStorage
function addToHistory(from, to, amount, result) {
    let history = JSON.parse(localStorage.getItem('aethelos_history')) || [];
    const item = { from, to, amount, result, id: Date.now() };
    history.unshift(item);
    history = history.slice(0, 3); // Mantener solo los últimos 3 para ligereza
    localStorage.setItem('aethelos_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('aethelos_history')) || [];
    if(history.length === 0) return;
    
    historyContainer.innerHTML = history.map(h => `
        <div class="flex justify-between items-center bg-zinc-900/80 p-2 rounded-xl text-xs border border-zinc-800">
            <span class="text-zinc-300 font-medium">${h.amount} ${h.from} → <span class="text-emerald-400 font-semibold">${h.result} ${h.to}</span></span>
            <span class="text-[10px] text-zinc-600">Reciente</span>
        </div>
    `).join('');
}

// Listeners de Eventos
amountInput.addEventListener('input', calculateConversion);
fromCurrency.addEventListener('change', calculateConversion);
toCurrency.addEventListener('change', calculateConversion);

// Guardar en historial solo cuando el usuario deja de escribir (blur)
amountInput.addEventListener('blur', () => {
    if(amountInput.value > 0) {
        addToHistory(fromCurrency.value, toCurrency.value, amountInput.value, resultOutput.innerText);
    }
});

swapBtn.addEventListener('click', () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    calculateConversion();
});

// Inicialización de la App
updateOnlineStatus();
renderHistory();

// Registro del Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}
