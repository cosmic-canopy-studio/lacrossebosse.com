import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "screenshots");

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1024, height: 768 },
];

const pages = [
  { name: "landing", path: "index.html" },
  { name: "ios", path: "ios/index.html" },
  { name: "android", path: "android/index.html" },
  { name: "privacy", path: "privacy/index.html" },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const pg of pages) {
    const url = `file://${join(root, pg.path).replace(/\\/g, "/")}`;
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const file = join(outDir, `${pg.name}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`✓ ${pg.name}-${vp.name}.png`);
  }

  await context.close();
}

await browser.close();
console.log("\nDone. Screenshots in ./screenshots/");
