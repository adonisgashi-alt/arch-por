// Builds files/Kaltrina-Ajdini-CV.pdf from tools/cv.html.
// Run from the repo root: node tools/build-cv.js   (needs Playwright + Chromium)
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(__dirname, "cv.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.resolve(__dirname, "../files/Kaltrina-Ajdini-CV.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log("Wrote files/Kaltrina-Ajdini-CV.pdf");
})();
