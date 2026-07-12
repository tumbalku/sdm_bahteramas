import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { hasUserColumn } from "@/lib/db-columns";
import { format } from "date-fns";

type SqlDumpRow = Record<string, unknown>;

function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) {
    return "NULL";
  }
  if (typeof val === "number") {
    return val.toString();
  }
  if (typeof val === "boolean") {
    return val ? "TRUE" : "FALSE";
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'`;
  }
  if (typeof val === "object") {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  // String escaping: replace ' with ''
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export async function generateDatabaseSqlDump(actor: { id: string; name: string; role: string }, ipAddress?: string): Promise<string> {
  const timestampStr = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const lines: string[] = [];

  lines.push(`-- ============================================================`);
  lines.push(`-- SMDP PORTAL - DATABASE SQL BACKUP DUMP`);
  lines.push(`-- Tanggal Backup : ${timestampStr}`);
  lines.push(`-- Operator       : ${actor.name} (${actor.role})`);
  lines.push(`-- ============================================================`);
  lines.push(``);
  lines.push(`SET statement_timeout = 0;`);
  lines.push(`SET lock_timeout = 0;`);
  lines.push(`SET client_encoding = 'UTF8';`);
  lines.push(`SET standard_conforming_strings = on;`);
  lines.push(``);

  const userExtraColumns = [
    ...(await hasUserColumn("birthPlace") ? ["birthPlace"] : []),
    ...(await hasUserColumn("hasOldEmployeeId") ? ["hasOldEmployeeId", "oldEmployeeId"] : []),
    ...(await hasUserColumn("hasTmt") ? ["hasTmt", "tmtStartDate", "tmtEndDate"] : []),
  ];

  // Define tables in foreign key dependency order
  const tables = [
    { name: "EmploymentStatus", cols: ["id", "name"] },
    { name: "EmployeeGroup", cols: ["id", "name", "employmentStatusId"] },
    { name: "ProfessionGroup", cols: ["id", "name"] },
    { name: "EmployeePosition", cols: ["id", "name", "professionGroupId"] },
    { name: "EmployeeRank", cols: ["id", "name"] },
    { name: "Workplace", cols: ["id", "name"] },
    {
      name: "User",
      cols: [
        "id", "employeeId", "nik", "email", "passwordHash", "name", "avatarUrl", "role",
        "gender", ...userExtraColumns, "birthDate", "academicDegree", "lastEducation", "religion", "maritalStatus",
        "phone", "address", "joinDate", "employmentStatusId", "employeeGroupId",
        "professionGroupId", "employeePositionId", "employeeRankId", "workplaceId",
        "createdAt", "updatedAt"
      ]
    },
    {
      name: "DocumentType",
      cols: [
        "id", "code", "name", "description", "archiveCategory", "isMandatory",
        "requiresExpiryDate", "requiresIssueDate", "requiresDocumentNumber", "allowedFormats", "maxSizeMb", "icon", "createdAt", "updatedAt"
      ]
    },
    { name: "DocumentTypeProfession", cols: ["id", "documentTypeId", "professionGroupId"] },
    {
      name: "DocumentRecord",
      cols: [
        "id", "ownerId", "documentTypeId", "status", "fileName", "filePath",
        "documentNumber", "issueDate", "expiryDate", "uploadedAt", "updatedAt"
      ]
    },
    {
      name: "VerificationHistory",
      cols: ["id", "documentRecordId", "status", "reviewedById", "reviewNote", "reviewedAt"]
    },
    {
      name: "SecurityLog",
      cols: ["id", "timestamp", "actorId", "actorName", "actorRole", "eventType", "resource", "ipAddress", "status", "metadata"]
    },
    { name: "SystemSetting", cols: ["key", "value", "label", "description", "updatedAt"] },
  ];

  for (const t of tables) {
    lines.push(`-- ------------------------------------------------------------`);
    lines.push(`-- Table: "${t.name}"`);
    lines.push(`-- ------------------------------------------------------------`);

    const colList = t.cols.map((c) => `"${c}"`).join(", ");

    try {
      const selectCols = t.cols.map((c) => `"${c}"`).join(", ");
      let offset = 0;
      const limit = 500;
      let hasMore = true;
      let rowCount = 0;

      while (hasMore) {
        const rawRows = await prisma.$queryRaw<SqlDumpRow[]>(
          Prisma.sql`SELECT ${Prisma.raw(selectCols)} FROM ${Prisma.raw(`"${t.name}"`)} LIMIT ${limit} OFFSET ${offset}`
        );

        if (rawRows && rawRows.length > 0) {
          for (const row of rawRows) {
            const valList = t.cols.map((col) => escapeSqlValue(row[col])).join(", ");
            lines.push(`INSERT INTO "${t.name}" (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;`);
          }
          rowCount += rawRows.length;
          if (rawRows.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        } else {
          if (offset === 0) {
            lines.push(`-- (Tidak ada data)`);
          }
          hasMore = false;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      lines.push(`-- Error dumping table ${t.name}: ${message}`);
    }
    lines.push(``);
  }

  lines.push(`-- ============================================================`);
  lines.push(`-- END OF BACKUP DUMP`);
  lines.push(`-- ============================================================`);

  // Log audit activity
  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "DATABASE_BACKUP",
    resource: "/api/v1/backup/export",
    ipAddress,
    status: "success",
    metadata: { generatedAt: timestampStr },
  });

  return lines.join("\n");
}
