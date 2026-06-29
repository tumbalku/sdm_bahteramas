import { prisma } from "@/lib/prisma";

export async function findUserProfileById(id: string) {
  const u: any = await prisma.user.findUnique({
    where: { id },
    include: {
      employmentStatus: true,
      employeeGroup: true,
      professionGroup: true,
      employeePosition: true,
      employeeRank: true,
      workplace: true,
    },
  });

  if (!u) return null;

  // Jika Prisma Client runtime di memori belum menyertakan kolom baru pada select query, ambil via raw query
  if (u.academicDegree === undefined || u.nik === undefined) {
    const rawRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT "nik", "academicDegree", "lastEducation", "religion", "maritalStatus", "phone", "address", "joinDate" FROM "User" WHERE "id" = $1`,
      id
    );
    if (rawRows && rawRows.length > 0) {
      Object.assign(u, rawRows[0]);
    }
  }

  return u;
}

export async function updateUserProfile(id: string, data: any) {
  const { nik, academicDegree, lastEducation, religion, maritalStatus, phone, address, joinDate, birthDate, name, gender } = data;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (gender !== undefined) updateData.gender = gender;
  if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // Sync 8 fields via Raw SQL safely to prevent Prisma Client engine validation locking errors
  const fields: string[] = [];
  const values: any[] = [];

  if (nik !== undefined) { fields.push(`"nik" = $${values.length + 1}`); values.push(nik || null); }
  if (academicDegree !== undefined) { fields.push(`"academicDegree" = $${values.length + 1}`); values.push(academicDegree || null); }
  if (lastEducation !== undefined) { fields.push(`"lastEducation" = $${values.length + 1}`); values.push(lastEducation || null); }
  if (religion !== undefined) { fields.push(`"religion" = $${values.length + 1}`); values.push(religion || null); }
  if (maritalStatus !== undefined) { fields.push(`"maritalStatus" = $${values.length + 1}`); values.push(maritalStatus || null); }
  if (phone !== undefined) { fields.push(`"phone" = $${values.length + 1}`); values.push(phone || null); }
  if (address !== undefined) { fields.push(`"address" = $${values.length + 1}`); values.push(address || null); }
  if (joinDate !== undefined) { fields.push(`"joinDate" = $${values.length + 1}`); values.push(joinDate ? new Date(joinDate) : null); }

  if (fields.length > 0) {
    fields.push(`"updatedAt" = NOW()`);
    const setClause = fields.join(", ");
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET ${setClause} WHERE "id" = $${values.length + 1}`,
      ...values,
      id
    );
  }

  return findUserProfileById(id);
}

export async function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}
