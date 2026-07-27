export const COMPLIANCE_STATUSES = [
  "Compliant",
  "Backlog",
  "Partially Compliant",
  "Non-Compliant",
  "On Hold",
] as const;

export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export const STATUS_META: Record<
  ComplianceStatus,
  { key: string; icon: string; colorName: string }
> = {
  Compliant: { key: "compliant", icon: "✓", colorName: "Green" },
  Backlog: { key: "backlog", icon: "○", colorName: "Grey" },
  "Partially Compliant": {
    key: "partially-compliant",
    icon: "◐",
    colorName: "Purple",
  },
  "Non-Compliant": {
    key: "non-compliant",
    icon: "!",
    colorName: "Yellow",
  },
  "On Hold": { key: "on-hold", icon: "Ⅱ", colorName: "Red" },
};

export function calculateParentStatus(
  children: readonly ComplianceStatus[],
): ComplianceStatus {
  if (children.some((status) => status === "On Hold")) return "On Hold";
  if (children.length > 0 && children.every((status) => status === "Compliant")) {
    return "Compliant";
  }
  if (children.length === 0 || children.every((status) => status === "Backlog")) {
    return "Backlog";
  }
  if (children.every((status) => status === "Non-Compliant")) {
    return "Non-Compliant";
  }
  return "Partially Compliant";
}

export function isComplianceStatus(value: unknown): value is ComplianceStatus {
  return COMPLIANCE_STATUSES.includes(value as ComplianceStatus);
}
