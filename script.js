const ship = document.getElementById("ship");
const infoPanel = document.getElementById("info");
const presetSelect = document.getElementById("presetSelect");
const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width");
const dwtInput = document.getElementById("dwt");
const runSimButton = document.getElementById("runSim");

let allShipData = [];

// --- Fungsi untuk ubah angka Newton jadi format mudah dibaca ---
function formatNewton(value) {
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return (value / 1e9).toFixed(2) + " GN";
  } else if (absValue >= 1e6) {
    return (value / 1e6).toFixed(2) + " MN";
  } else if (absValue >= 1e3) {
    return (value / 1e3).toFixed(2) + " kN";
  } else {
    return value.toFixed(2) + " N";
  }
}

// --- Muat Data JSON ---
document.addEventListener("DOMContentLoaded", () => {
  fetch("./data/roll_train_data_yang_sudah_diserhanakan.json")
    .then(res => res.json())
    .then(data => {
      allShipData = data;
      populateSelectOptions(data);
    })
    .catch(err => {
      console.error("Error:", err);
      infoPanel.innerHTML = "⚠️ Gagal memuat data kapal.<br>Gunakan mode Custom.";
    });
});

function populateSelectOptions(data) {
  data.forEach(kapal => {
    const opt = document.createElement("option");
    opt.value = kapal.ship;
    opt.text = `${kapal.ship} (${kapal.type})`;
    presetSelect.appendChild(opt);
  });
}

presetSelect.addEventListener("change", e => {
  const selected = e.target.value;
  if (selected === "custom") {
    lengthInput.value = "";
    widthInput.value = "";
    dwtInput.value = "";
  } else {
    const shipData = allShipData.find(k => k.ship === selected);
    if (shipData) {
      lengthInput.value = shipData.length;
      widthInput.value = shipData.breath;
      dwtInput.value = shipData.dwt;
    }
  }
});

function computeHeelAngle(cargo, dwt, L, B) {
  const ratio = cargo / dwt;
  const t0 = 0.8;
  const K = 5;
  const maxAngle = 20;
  const excess = Math.max(0, ratio - t0);
  const shapeFactor = L / B;
  const theta = K * excess * shapeFactor;
  return Math.min(theta, maxAngle);
}

runSimButton.addEventListener("click", () => {
  const L = parseFloat(lengthInput.value);
  const B = parseFloat(widthInput.value);
  const DWT = parseFloat(dwtInput.value);
  const cargo = parseFloat(document.getElementById("cargoWeight").value);

  if (isNaN(L) || isNaN(B) || isNaN(DWT) || isNaN(cargo)) {
    infoPanel.innerHTML = "🔴 Pastikan semua input terisi angka yang benar.";
    return;
  }

  ship.classList.remove("sink", "wobble");
  void ship.offsetWidth;

  const rho = 1025;
  const g = 9.81;
  const volume = L * B * 0.5;
  const buoyancyForce = rho * g * volume;

  const loadRatio = cargo / DWT;
  const heelAngle = computeHeelAngle(cargo, DWT, L, B);

  let statusText = "";
  if (loadRatio < 0.8) {
    ship.classList.add("wobble");
    statusText = "🟢 Kapal stabil.";
  } else if (loadRatio < 1) {
    ship.classList.add("wobble");
    statusText = "🟡 Kapal agak berat, hati-hati.";
  } else {
    ship.classList.add("sink");
    statusText = "🔴 Kapal tenggelam!";
  }

  ship.style.transition = "transform 1s ease";
  ship.style.transformOrigin = "center bottom";
  ship.style.transform = `translateX(-50%) rotate(${heelAngle.toFixed(2)}deg)`;

  // --- tampilkan hasil dengan format yang lebih mudah dibaca ---
  infoPanel.innerHTML = `
    ${statusText}<br>
    Rasio muatan: ${(loadRatio * 100).toFixed(1)}%<br>
    Gaya apung: ${formatNewton(buoyancyForce)}<br>
    Sudut kemiringan: ${heelAngle.toFixed(2)}°
  `;

  const resultCard = document.getElementById("result");
  if (resultCard) {
    resultCard.innerHTML = `
      <div class="status">${statusText}</div>
      <p><span id="ratioVal">${(loadRatio * 100).toFixed(1)}%</span></p>
      <p><span id="buoyVal">${formatNewton(buoyancyForce)}</span></p>
      <p><span id="heelVal">${heelAngle.toFixed(2)}°</span></p>
    `;
    resultCard.classList.remove("hidden", "success", "warning", "danger");
    if (loadRatio < 0.8) resultCard.classList.add("success");
    else if (loadRatio < 1) resultCard.classList.add("warning");
    else resultCard.classList.add("danger");
  }
});
