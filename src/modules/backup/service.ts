import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { format } from "date-fns";

function escapeSqlValue(val: any): string {
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
        "gender", "birthDate", "academicDegree", "lastEducation", "religion", "maritalStatus", 
        "phone", "address", "joinDate", "employmentStatusId", "employeeGroupId", 
        "professionGroupId", "employeePositionId", "employeeRankId", "workplaceId", 
        "createdAt", "updatedAt"
      ] 
    },
    { name: "UserRole", cols: ["id", "userId", "role"] },
    { 
      name: "DocumentType", 
      cols: [
        "id", "code", "name", "description", "archiveCategory", "isMandatory", 
        "requiresExpiryDate", "allowedFormats", "maxSizeMb", "icon", "createdAt", "updatedAt"
      ] 
    },
    { name: "DocumentTypeProfession", cols: ["id", "documentTypeId", "professionGroupId"] },
    { 
      name: "DocumentRecord", 
      cols: [
        "id", "ownerId", "documentTypeId", "status", "fileName", "filePath", 
        "issueDate", "expiryDate", "uploadedAt", "updatedAt"
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
      const rawRows: any[] = await prisma.$queryRawUnsafe(`SELECT ${selectCols} FROM "${t.name}"`);

      if (rawRows && rawRows.length > 0) {
        for (const row of rawRows) {
          const valList = t.cols.map((col) => escapeSqlValue(row[col])).join(", ");
          lines.push(`INSERT INTO "${t.name}" (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;`);
        }
      } else {
        lines.push(`-- (Tidak ada data)`);
      }
    } catch (err: any) {
      lines.push(`-- Error dumping table ${t.name}: ${err?.message}`);
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
