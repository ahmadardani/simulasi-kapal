const shipSelect = document.getElementById("shipSelect");
const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width");
const dwtInput = document.getElementById("dwt");
const cargoWeight = document.getElementById("cargoWeight");
const cargoValue = document.getElementById("cargoValue");
const ship = document.getElementById("ship");
const statusText = document.getElementById("statusText");

const buoyancyForce = document.getElementById("buoyancyForce");
const draftDepth = document.getElementById("draftDepth");
const tiltAngle = document.getElementById("tiltAngle");

cargoWeight.addEventListener("input", () => {
  cargoValue.textContent = cargoWeight.value + " ton";
});

shipSelect.addEventListener("change", () => {
  if (shipSelect.value === "marc") {
    lengthInput.value = 89.7;
    widthInput.value = 13.6;
    dwtInput.value = 4135;
    cargoWeight.max = 5000;
  } else if (shipSelect.value === "celine") {
    lengthInput.value = 129.1;
    widthInput.value = 15.9;
    dwtInput.value = 8600;
    cargoWeight.max = 9000;
  } else {
    lengthInput.value = "";
    widthInput.value = "";
    dwtInput.value = "";
    cargoWeight.max = 5000;
  }
});

document.getElementById("simulateBtn").addEventListener("click", () => {
  const L = parseFloat(lengthInput.value);
  const B = parseFloat(widthInput.value);
  const DWT = parseFloat(dwtInput.value);
  const W = parseFloat(cargoWeight.value);

  const rho = 1.025; // kepadatan air laut (ton/m³)
  const volume = L * B * 0.5; // perkiraan volume terendam maksimum
  const FA = rho * volume; // gaya apung ton (perkiraan kasar)

  const ratio = W / DWT;
  const draft = ratio * 10; // makin berat makin dalam
  const k = 0.002; // konstanta kemiringan
  const angle = Math.abs(W - FA) * k;

  draftDepth.textContent = draft.toFixed(2);
  buoyancyForce.textContent = FA.toFixed(2);
  tiltAngle.textContent = angle.toFixed(2);

  let status = "Stabil";
  if (ratio > 0.8 && ratio <= 1) status = "Mulai Miring";
  else if (ratio > 1) status = "Tidak Stabil";

  statusText.textContent = `Status: ${status}`;

  // animasi kapal naik turun
  const baseY = 160;
  const newY = baseY + draft;
  ship.setAttribute("y", Math.min(newY, 240));
});
