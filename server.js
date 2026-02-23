const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer-core");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "start.html"));
});

app.post("/generate-pdf", async (req, res) => {
  let browser;
  try {
    const { htmlContent, stylePath } = req.body;

    // Puppeteer für Cloud-Umgebungen optimieren
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const page = await browser.newPage();
    const fullHtml = `
      <html>
        <head>
          <style>.watermark { display: none !important; }</style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Bewerbung.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    if (browser) await browser.close();
    console.error(error);
    res.status(500).send("Fehler bei PDF-Erstellung");
  }
});

// Nur EIN Listen-Aufruf am Ende
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server läuft auf Port ${PORT}`);
});
