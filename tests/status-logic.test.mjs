import assert from "node:assert/strict";
import test from "node:test";
import { calculateParentStatus } from "../app/lib/status.ts";

test("applies compliance roll-up rules in the required order", () => {
  assert.equal(calculateParentStatus(["Compliant", "On Hold"]), "On Hold");
  assert.equal(calculateParentStatus(["Compliant", "Compliant"]), "Compliant");
  assert.equal(calculateParentStatus(["Backlog", "Backlog"]), "Backlog");
  assert.equal(calculateParentStatus(["Non-Compliant", "Non-Compliant"]), "Non-Compliant");
  assert.equal(calculateParentStatus(["Compliant", "Backlog"]), "Partially Compliant");
  assert.equal(calculateParentStatus(["Non-Compliant", "Backlog"]), "Partially Compliant");
  assert.equal(calculateParentStatus(["Partially Compliant"]), "Partially Compliant");
});
