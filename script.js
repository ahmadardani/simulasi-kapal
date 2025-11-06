// --- Elemen DOM ---
const ship = document.getElementById("ship");
const result = document.getElementById("result");
const presetSelect = document.getElementById("presetSelect");
const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width"); // Ini adalah input 'Lebar'
const dwtInput = document.getElementById("dwt");
const runSimButton = document.getElementById("runSim");

// Variabel untuk menyimpan semua data kapal dari JSON
let allShipData = [];

// --- 1. Muat Data Saat Halaman Dibuka ---
// Event 'DOMContentLoaded' memastikan script berjalan setelah HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Ambil data dari file JSON
  fetch('./data/roll_train_data_yang_sudah_diserhanakan.json')
    .then(response => {
      // Cek jika file JSON ada dan bisa diakses
      if (!response.ok) {
        throw new Error('Gagal memuat data: ' + response.statusText);
      }
      return response.json(); // Ubah data teks JSON menjadi objek JavaScript
    })
    .then(data => {
      // Simpan data ke variabel global
      allShipData = data;
      // Panggil fungsi untuk mengisi dropdown
      populateSelectOptions(allShipData);
    })
    .catch(error => {
      // Tampilkan error jika gagal
      console.error('Error saat memuat JSON:', error);
      result.innerHTML = "Gagal memuat data kapal. Cek console.";
    });
});

// --- 2. Fungsi untuk Mengisi Dropdown ---
function populateSelectOptions(data) {
  // Loop setiap kapal di dalam data JSON
  data.forEach(kapal => {
    // Buat elemen <option> baru
    const option = document.createElement('option');
    option.value = kapal.ship; // misal: "Marc"
    option.text = `${kapal.ship} (${kapal.type})`; // misal: "Marc (General Cargo)"
    // Masukkan ke dalam <select>
    presetSelect.appendChild(option);
  });
}

// --- 3. Event Listener untuk Dropdown (Mengisi Input) ---
// --- 3. Event Listener untuk Dropdown (Mengisi Input) ---
presetSelect.addEventListener("change", e => {
  const selectedShipName = e.target.value;

  if (selectedShipName === "custom") {
    // Jika pilih "Custom", kosongkan input dan beri placeholder
    lengthInput.value = "";
    widthInput.value = "";
    dwtInput.value = "";

    lengthInput.placeholder = "Masukkan panjang kapal (m)";
    widthInput.placeholder = "Masukkan lebar kapal (m)";
    dwtInput.placeholder = "Masukkan DWT kapal";

  } else {
    // Jika pilih kapal dari preset
    const selectedShip = allShipData.find(kapal => kapal.ship === selectedShipName);

    if (selectedShip) {
      lengthInput.value = selectedShip.length;
      widthInput.value = selectedShip.breath; // 'breath' → 'width'
      dwtInput.value = selectedShip.dwt;

      // Kosongkan placeholder supaya tidak mengganggu tampilan
      lengthInput.placeholder = "";
      widthInput.placeholder = "";
      dwtInput.placeholder = "";
    }
  }
});

// --- 4. Event Listener Tombol Simulasi (DENGAN PERBAIKAN KOMA) ---
runSimButton.addEventListener("click", () => {
  
  // ======== PERBAIKAN KOMA DI SINI ========
  // Ambil nilai sebagai string, ganti koma (,) dengan titik (.)
  // Kita tambahkan .toString() untuk jaga-jaga jika ada data yg sudah angka
  const lengthStr = lengthInput.value.toString().replace(',', '.');
  const widthStr = widthInput.value.toString().replace(',', '.');
  
  // Baru lakukan parseFloat pada string yang sudah benar
  const length = parseFloat(lengthStr);
  const width = parseFloat(widthStr);
  const dwt = parseFloat(dwtInput.value); // dwt sudah benar (angka)
  // ===================================

  const cargo = parseFloat(document.getElementById("cargoWeight").value);

  ship.classList.remove("sink", "wobble");
  void ship.offsetWidth; // reset animation state

  // Cek jika input valid (bukan NaN - Not a Number)
  if (isNaN(length) || isNaN(width) || isNaN(dwt) || isNaN(cargo)) {
    result.innerHTML = "🔴 Pastikan semua input terisi angka yang benar.";
    return; // Hentikan simulasi
  }

  const buoyancy = length * width * 0.5; // perkiraan daya apung (fiktif)
  const loadRatio = cargo / dwt;

  if (loadRatio < 0.8) {
    ship.classList.add("wobble");
    result.innerHTML = `🟢 Kapal stabil. (Rasio muatan: ${(loadRatio*100).toFixed(1)}%)`;
  } else if (loadRatio < 1) {
    ship.classList.add("wobble");
    result.innerHTML = `🟡 Kapal agak berat, hati-hati (Rasio: ${(loadRatio*100).toFixed(1)}%)`;
  } else {
    ship.classList.add("sink");
    result.innerHTML = `🔴 Kapal tenggelam! Muatan melebihi DWT (${(loadRatio*100).toFixed(1)}%)`;
  }
});