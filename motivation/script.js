console.log("script.js geladen");

// =============================
// === Formular Setup
// =============================
const form = document.getElementById("vitagenForm");

// Eingabefelder
const fields = {
  name: "name",
  adresse: "adresse",
  kontakt: "kontakt",
  posten: "posten",
  funktion: "funktion",
  arbeitgeber: "arbeitgeber",
  stichwoerter: "stichwoerter",
  stichwoerter2: "stichwoerter2",
  stichwoerter3: "stichwoerter3",
  text: "text",
  fliesstext: "fliesstext",
  hallo: "hallo",
  adieu: "adieu",
  datum: "datum",
  unterschrift: "unterschrift"
};

// =============================
// === Daten speichern / laden
// =============================
function saveFormData() {
  const data = {};

  for (const key in fields) {
    const el = document.getElementById(fields[key]);
    if (el) data[key] = el.value;
  }

  // Foto ebenfalls speichern, falls vorhanden
  const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  if (savedData.foto) data.foto = savedData.foto;

  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
}

function loadFormData() {
  const saved = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");

  for (const key in fields) {
    const el = document.getElementById(fields[key]);
    if (el && saved[key]) el.value = saved[key];
  }

  // Foto im Formular anzeigen
  if (saved.foto) {
    const fotoContainer = document.getElementById("foto-container");
    if (fotoContainer) {
      fotoContainer.innerHTML = `<img src="${saved.foto}" style="max-width:150px;margin:10px auto;display:block;border-radius:4px;">`;
    }
  }
}

// =============================
// === FOTO-UPLOAD
// =============================
const fileInput = document.getElementById('foto-upload');
if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const fotoData = e.target.result; // Base64
      const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
      savedData.foto = fotoData;
      localStorage.setItem("vitagen_motivation", JSON.stringify(savedData));

      const fotoContainer = document.getElementById('foto-container');
      if (fotoContainer) {
        fotoContainer.innerHTML = `<img src="${fotoData}" style="max-width:150px;margin:10px auto;display:block;border-radius:4px;">`;
      }
    };
    reader.readAsDataURL(file);
  });
}

// =============================
// === Buttons: Speichern & Vorschau
// =============================
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) saveBtn.addEventListener("click", saveFormData);

const previewBtn = document.getElementById("previewBtn");
if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    saveFormData();
    window.open("preview.html", "_blank");
  });
}

// Formular niemals normal absenden
if (form) form.addEventListener("submit", e => e.preventDefault());

// Gespeicherte Daten beim Laden setzen
loadFormData();

// =============================
// === KI-Integration: Fließtext erstellen
// =============================
const fliesstextBtn = document.getElementById("generateFliesstext");
if (fliesstextBtn) {
  fliesstextBtn.addEventListener("click", async () => {
    const stichpunkte = document.getElementById("stichwoerter2").value.trim();
    const funktion = document.getElementById("funktion").value.trim();

    if (!stichpunkte) return alert("Bitte Stichpunkte eingeben!");
    if (!funktion) return alert("Bitte Funktion angeben!");

    // Ladeanzeige
    fliesstextBtn.disabled = true;
    fliesstextBtn.textContent = "Generiere Fließtext...";

    try {
      // Anfrage an Node.js Server
      const response = await fetch("https://replit.com/@syntext/Vita-Gen-Server#server.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stichpunkte, funktion })
      });

      if (!response.ok) throw new Error("Serverfehler");

      const data = await response.json();
      document.getElementById("stichwoerter2").value = data.fliesstext || "";

      // Optional: direkt speichern
      saveFormData();

      alert("Fließtext erfolgreich erstellt!");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Erstellen des Fließtexts!");
    } finally {
      fliesstextBtn.disabled = false;
      fliesstextBtn.textContent = "Fließtext erstellen";
    }
  });
}