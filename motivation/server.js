// server.js
import express from "express";
import fetch from "node-fetch"; // falls Node <18, sonst global fetch verwenden
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// =============================
// === OpenAI API Key ========
// =============================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // in Terminal setzen: export OPENAI_API_KEY="..." (Mac/Linux) oder setx OPENAI_API_KEY "..." (Windows)

// =============================
// === Route für Fließtext =====
// =============================
app.post("/generate-fliesstext", async (req, res) => {
  const { stichpunkte } = req.body;
  if (!stichpunkte) return res.status(400).json({ error: "Keine Stichpunkte übergeben" });

  try {
    const prompt = `Schreibe aus folgenden Stichpunkten einen zusammenhängenden, professionellen Motivationstext:\n\n${stichpunkte}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      })
    });

    const data = await response.json();
    const fliesstext = data.choices?.[0]?.message?.content || "";

    res.json({ fliesstext });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Generieren des Fließtexts" });
  }
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));