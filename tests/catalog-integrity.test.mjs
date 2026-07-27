import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catalog = JSON.parse(await readFile(new URL("../app/data/cjis-catalog.json", import.meta.url), "utf8"));

test("catalog is policy-first and complete across the official families", () => {
  assert.equal(catalog.policy.version, "6.0");
  assert.equal(catalog.policy.effectiveDate, "2024-12-27");
  assert.equal(catalog.families.length, 18);
  const controls = catalog.families.flatMap((family) => family.controls);
  assert.equal(controls.length, 294);
  assert.equal(new Set(controls.map((control) => control.id)).size, controls.length);
  assert.ok(controls.every((control) => control.requirement.length > 0));
  assert.ok(controls.every((control) => /CJIS Security Policy v6\.0/.test(control.policyCitation)));
  assert.ok(controls.every((control) => control.checklist.length > 0));
  assert.equal(controls.filter((control) => control.needsVerification).length, 0);
});

test("labels the known SA-15 numbering conflict for verification", () => {
  const controls = catalog.families.flatMap((family) => family.controls);
  const control = controls.find((item) => item.id === "SA-15 (1)");
  assert.ok(control);
  assert.equal(control.guidanceNeedsVerification, true);
  assert.match(control.guidanceVerificationNote, /GovRAMP assessor matrix labels/);
  assert.match(control.guidanceVerificationNote, /official CJIS Security Policy/);
});

test("uses an original four-step checklist without GovRAMP placeholders", () => {
  const controls = catalog.families.flatMap((family) => family.controls);
  const checklist = controls.flatMap((control) => control.checklist);
  assert.equal(checklist.length, 1176);
  assert.ok(controls.every((control) => control.checklist.length === 4));
  assert.equal(new Set(checklist.map((item) => item.id)).size, checklist.length);
  assert.ok(checklist.every((item) => item.id.startsWith("policy-v1-")));
  assert.ok(checklist.every((item) => /Independently authored implementation guidance based on CJIS Security Policy v6\.0/.test(item.source)));
  assert.ok(checklist.every((item) => item.details.length > 0));

  const checklistContent = checklist.map((item) => `${item.text}\n${item.details}\n${item.source}`).join("\n");
  assert.doesNotMatch(checklistContent, /\[organization-(?:defined|determined)/i);
  assert.doesNotMatch(checklistContent, /GovRAMP/i);
});

test("surfaces concrete CJIS frequencies and named conditions", () => {
  const controls = catalog.families.flatMap((family) => family.controls);
  const validation = (id) => controls.find((control) => control.id === id)?.checklist.find((item) => item.id.endsWith("-validate"));

  assert.match(validation("AC-1").details, /annually/i);
  assert.match(validation("AC-1").details, /unauthorized access/i);
  assert.match(validation("AC-2").details, /One day/i);
  assert.match(validation("AC-2").details, /at least annually/i);
  assert.match(validation("AC-2 (3)").text, /within one \(1\) week.*90 calendar days/i);
  assert.match(validation("SI-4").details, /weekly/i);
  assert.match(validation("SI-4").details, /unauthorized/i);
});
