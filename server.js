const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(__dirname)); // erlaubt Zugriff auf deine HTML & CSS Dateien

// PDF generieren
app.post("/generate-pdf", async (req, res) => {
  try {
    const { htmlContent, stylePath } = req.body;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // HTML zusammenbauen
    const fullHtml = `
      <html>
        <head>
          <link rel="stylesheet" href="file://${path.join(__dirname, stylePath)}">
          <style>
            .watermark { display: none !important; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Bewerbung.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler bei PDF-Erstellung");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});