import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const baseUrl = process.env.CJIS_TEST_BASE_URL ?? "http://localhost:3000";

function fetchApp(path, headers = {}) {
  return fetch(`${baseUrl}${path}`, { headers: { accept: path === "/" ? "text/html" : "application/json", ...headers }, redirect: "manual" });
}

test("renders one anonymous public read-only catalog", async () => {
  const response = await fetchApp("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Browse CJIS controls without an account/);
  assert.match(html, /Public read-only view/);
  assert.match(html, /no accounts, sign-in, saved progress, comments, evidence entry/i);
  assert.doesNotMatch(html, /Checklist methodology and reference/);
  assert.doesNotMatch(html, /GovRAMP Moderate Authorized &amp; Provisional Status Assessor Matrix v1\.6/);
  assert.match(html, /Created by Amrit Dhillon, PMP, CISM/);
  assert.match(html, /Intellectual property notice/);
  assert.match(html, /substantiated concerns will be reviewed promptly/i);
  assert.doesNotMatch(html, /signin-with-chatgpt|signout-with-chatgpt|Sign in|Sign up|Your compliance workspace|Signed in as/i);
});

test("authentication headers do not create a different view", async () => {
  const response = await fetchApp("/", { "oai-authenticated-user-email": "viewer@example.test" });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Public read-only view/);
  assert.doesNotMatch(html, /viewer@example\.test|signin-with-chatgpt|signout-with-chatgpt|Your compliance workspace/i);
});

test("write and authentication code is absent from the application surface", async () => {
  const navigator = await readFile(new URL("../app/NavigatorApp.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(navigator, /Compliance summary/);
  assert.match(navigator, /assign ownership, retain evidence, and remediate gaps/);
  assert.match(navigator, /Search results/);
  assert.match(navigator, /openSearchResult/);
  assert.match(navigator, /control ID such as AC-2/);
  assert.doesNotMatch(navigator, /Checklist methodology and reference/);
  assert.doesNotMatch(`${navigator}\n${page}`, /api\/progress|signin-with-chatgpt|signout-with-chatgpt|evidenceDraft|saveSelection|getPageIdentity/);

  const progress = await fetchApp("/api/progress");
  assert.equal(progress.status, 404);
});
