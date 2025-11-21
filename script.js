const ship = document.getElementById("ship");
const infoPanel = document.getElementById("info");
const presetSelect = document.getElementById("presetSelect");

// Input Data Kapal
const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width");
const dwtInput = document.getElementById("dwt");

// Input Muatan
const cargoInput = document.getElementById("cargoWeight");

const runSimButton = document.getElementById("runSim");
let allShipData = [];

// --- 1. Muat Data JSON ---
document.addEventListener("DOMContentLoaded", () => {
  fetch("./data/roll_train_data_yang_sudah_diserhanakan.json")
    .then(res => res.json())
    .then(data => {
      allShipData = data;
      populateSelectOptions(data);
    })
    .catch(err => {
      console.error("Error:", err);
      infoPanel.innerHTML = "⚠️ Gagal memuat data JSON.<br>Silakan gunakan mode Custom.";
    });
});

// --- 2. Isi Dropdown ---
function populateSelectOptions(data) {
  data.forEach(kapal => {
    const opt = document.createElement("option");
    opt.value = kapal.ship;
    opt.text = `${kapal.ship} (${kapal.type})`;
    presetSelect.appendChild(opt);
  });
}

// --- 3. Logika Ganti Pilihan (DENGAN FITUR RESET MUATAN) ---
presetSelect.addEventListener("change", e => {
  const selected = e.target.value;

  // 🔥 FITUR YANG ANDA MINTA:
  // Reset input muatan jadi kosong setiap ganti kapal
  cargoInput.value = ""; 
  
  // Reset info panel agar user tahu data berubah
  infoPanel.innerHTML = "Kapal diganti.<br>Silakan isi ulang berat muatan.";
  
  // Reset posisi visual kapal
  ship.classList.remove("sink", "wobble");
  ship.style.transform = "translateX(-50%) rotate(0deg)";

  if (selected === "custom") {
    // Mode Custom: Kosongkan spesifikasi kapal
    lengthInput.value = "";
    widthInput.value = "";
    dwtInput.value = "";

    // Buka kunci input spesifikasi
    lengthInput.disabled = false;
    widthInput.disabled = false;
    dwtInput.disabled = false;

  } else {
    // Mode Preset: Isi spesifikasi kapal dari JSON
    const shipData = allShipData.find(k => k.ship === selected);
    if (shipData) {
      lengthInput.value = shipData.length;
      widthInput.value = shipData.breath;
      dwtInput.value = shipData.dwt;

      // Kunci input spesifikasi (supaya tidak diubah manual)
      lengthInput.disabled = true;
      widthInput.disabled = true;
      dwtInput.disabled = true;
    }
  }
});

// --- 4. Rumus Helper ---
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

function formatNewton(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + " GN";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + " MN";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + " kN";
  return value.toFixed(2) + " N";
}

// --- 5. Fungsi Utama Simulasi ---
function runSimulation() {
  const L = parseFloat(lengthInput.value);
  const B = parseFloat(widthInput.value);
  const DWT = parseFloat(dwtInput.value);
  const cargo = parseFloat(cargoInput.value);

  if (isNaN(L) || isNaN(B) || isNaN(DWT) || isNaN(cargo)) {
    infoPanel.innerHTML = "🔴 Mohon isi semua angka dengan benar.";
    return;
  }

  // Reset Animasi sebelum mulai baru
  ship.classList.remove("sink", "wobble");
  void ship.offsetWidth; // Trigger reflow

  const rho = 1025;
  const g = 9.81;
  const volume = L * B * 0.5; 
  const buoyancyForce = rho * g * volume;

  const loadRatio = cargo / DWT;
  const heelAngle = computeHeelAngle(cargo, DWT, L, B);
  let statusText = "";

  // Logika Status
  if (loadRatio < 0.8) {
    ship.classList.add("wobble");
    statusText = "🟢 Stabil";
  } else if (loadRatio <= 1.0) {
    ship.classList.add("wobble");
    statusText = "🟡 Waspada (Berat)";
  } else {
    ship.classList.add("sink");
    statusText = "🔴 TENGGELAM (Overload)";
  }

  // Update Visual Kapal
  ship.style.transition = "transform 1s ease";
  ship.style.transformOrigin = "center bottom";

  if (loadRatio <= 1.0) {
      ship.style.transform = `translateX(-50%) rotate(${heelAngle.toFixed(2)}deg)`;
  } else {
      ship.style.transform = `translateX(-50%) rotate(${heelAngle.toFixed(2)}deg)`;
  }

  // Update Info Panel
  infoPanel.innerHTML = `
    <strong>Status: ${statusText}</strong><br>
    Rasio Muatan: ${(loadRatio * 100).toFixed(1)}%<br>
    Gaya Apung: ${formatNewton(buoyancyForce)}<br>
    Kemiringan: ${heelAngle.toFixed(2)}°
  `;
}

// Event Listeners
runSimButton.addEventListener("click", runSimulation);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSimulation();
});

// Navigasi Tab
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    const target = tab.getAttribute("data-tab");
    document.getElementById(`tab-${target}`).classList.add("active");
  });
});