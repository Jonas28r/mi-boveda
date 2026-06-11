import { convert } from "../core/calculator.js";

export function renderUI(el, state, inputs) {
  const { amount, from, to } = inputs;
  const result = convert(amount, from, to);

  el.result.innerText =
    to === "BTC"
      ? result.value.toFixed(8)
      : result.value.toLocaleString("es-ES", {
          maximumFractionDigits: 2
        });

  // Cálculo inverso correcto del tipo de cambio según la base cruzada
  const calculatedRate = result.rate[from] > 0 ? (result.rate[to] / result.rate[from]) : 0;
  
  el.rate.innerText = `1 ${from} = ${calculatedRate.toFixed(4)} ${to}`;
  el.fee.innerText = `${result.fee * 100}%`;
  el.time.innerText = new Date().toLocaleTimeString();
}
