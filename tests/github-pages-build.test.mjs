import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build uses the repository base path and stays public-only", async () => {
  const outputDirectory = new URL("../pages-dist/", import.meta.url);
  const html = await readFile(new URL("index.html", outputDirectory), "utf8");
  const assets = await readdir(new URL("assets/", outputDirectory));
  const JavaScriptFile = assets.find((file) => file.endsWith(".js"));

  assert.ok(JavaScriptFile, "Expected a JavaScript bundle in pages-dist/assets");
  assert.match(html, /\/CJIS-Compliance-Navigator\/assets\//);
  assert.match(html, /\/CJIS-Compliance-Navigator\/og\.png/);

  const JavaScriptBundle = await readFile(
    new URL(`assets/${JavaScriptFile}`, outputDirectory),
    "utf8",
  );

  assert.match(JavaScriptBundle, /Public read-only view/);
  assert.match(JavaScriptBundle, /Created by Amrit Dhillon, PMP, CISM\./);
  assert.doesNotMatch(JavaScriptBundle, /signin-with-chatgpt|\/api\/progress/);
});
