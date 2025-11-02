const ship = document.getElementById("ship");
const result = document.getElementById("result");

document.getElementById("presetSelect").addEventListener("change", e => {
  const val = e.target.value;
  if (val === "marc") {
    document.getElementById("length").value = 89.7;
    document.getElementById("width").value = 13.6;
    document.getElementById("dwt").value = 4135;
  } else if (val === "celine") {
    document.getElementById("length").value = 129.1;
    document.getElementById("width").value = 15.9;
    document.getElementById("dwt").value = 8600;
  } else {
    document.getElementById("length").value = 100;
    document.getElementById("width").value = 20;
    document.getElementById("dwt").value = 4000;
  }
});

document.getElementById("runSim").addEventListener("click", () => {
  const length = parseFloat(document.getElementById("length").value);
  const width = parseFloat(document.getElementById("width").value);
  const dwt = parseFloat(document.getElementById("dwt").value);
  const cargo = parseFloat(document.getElementById("cargoWeight").value);

  ship.classList.remove("sink", "wobble");
  void ship.offsetWidth; // reset animation state

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
