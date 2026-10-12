import assert from "node:assert/strict";
import { retiredPages } from "../lib/publicFeatures";

const base = process.env.EXAM_TEST_BASE_URL ?? "http://127.0.0.1:3100";
async function main() {
  for (const root of retiredPages) {
    for (const path of [root, `${root}/saved-item?legacy=1`]) {
      const response = await fetch(base + path, { redirect: "manual" });
      assert.equal(response.status, 307, path);
      assert.equal(new URL(response.headers.get("location")!, base).pathname, "/exam", path);
    }
  }
  console.log(`PASS: ${retiredPages.length} archived sections and nested URLs redirect to the exam.`);
  const manifestResponse = await fetch(base + "/manifest.json", { redirect: "manual" });
  assert.equal(manifestResponse.status, 200, "Install manifest must not redirect to an HTML page");
  assert.match(manifestResponse.headers.get("content-type") ?? "", /application\/(?:manifest\+)?json/);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  for (const size of ["192x192", "512x512"]) {
    const icon = manifest.icons.find((item: { sizes: string; type: string }) => item.sizes === size && item.type === "image/png");
    assert.ok(icon, `Install icon ${size}`);
    assert.equal((await fetch(new URL(icon.src, base))).status, 200);
  }
  console.log("PASS: install manifest and required phone icons are publicly available.");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
