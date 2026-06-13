import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

const GAME_REPO = "C:/Users/uosmi/code/lacrosse-bosse";
const OUT = "C:/Users/uosmi/code/lacrossebosse.com/assets";

await mkdir(OUT, { recursive: true });

// App icon — 80px for header, 160px for 2x
const icon = join(GAME_REPO, "assets/ios/lacrossebosse-iOS-Default-1024x1024@1x.png");
await sharp(icon).resize(160, 160).webp({ quality: 90 }).toFile(join(OUT, "icon-160.webp"));
console.log("✓ icon-160.webp");

// Screenshots — 534x300 for 1x display, serve at that size
const screenshots = [
  "1_clipboard.png",
  "2_clipboard_selected.png",
  "3_editor.png",
  "4_gameplay.png",
];

for (const file of screenshots) {
  const src = join(GAME_REPO, "assets/android/screenshots", file);
  const name = file.replace(".png", ".webp");
  await sharp(src).resize(534, 300, { fit: "cover" }).webp({ quality: 80 }).toFile(join(OUT, name));
  console.log(`✓ ${name}`);
}

// Report sizes
const { readdirSync, statSync } = await import("fs");
let total = 0;
for (const f of readdirSync(OUT)) {
  const size = statSync(join(OUT, f)).size;
  total += size;
  console.log(`  ${f}: ${(size / 1024).toFixed(1)} KB`);
}
console.log(`\nTotal: ${(total / 1024).toFixed(1)} KB`);
