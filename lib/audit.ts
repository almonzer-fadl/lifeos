import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditAction = "created" | "updated" | "deleted";

export async function logTransactionAudit(
  transactionId: string,
  action: AuditAction,
  changes: Record<string, unknown>
) {
  try {
    await db.transactionAudit.create({
      data: {
        transactionId,
        action,
        changes: changes as Prisma.InputJsonValue,
      },
    });
  } catch {
    console.error(`[audit] Failed to log ${action} for transaction ${transactionId}`);
  }
}

export async function logBatchAudit(
  entries: { transactionId: string; action: AuditAction; changes: Record<string, unknown> }[]
) {
  try {
    await db.transactionAudit.createMany({
      data: entries.map((e) => ({
        transactionId: e.transactionId,
        action: e.action,
        changes: e.changes as Prisma.InputJsonValue,
      })),
    });
  } catch {
    console.error(`[audit] Failed to log batch audit for ${entries.length} entries`);
  }
}
