import { prisma } from "@/lib/prisma";

export async function findUserProfileById(id: string) {
  return prisma.user.findUnique({
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
}

export async function updateUserProfile(id: string, data: any) {
  const {
    nik,
    academicDegree,
    lastEducation,
    religion,
    maritalStatus,
    phone,
    address,
    joinDate,
    birthDate,
    name,
    gender,
  } = data;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (gender !== undefined) updateData.gender = gender;
  if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;

  if (nik !== undefined) updateData.nik = nik || null;
  if (academicDegree !== undefined) updateData.academicDegree = academicDegree || null;
  if (lastEducation !== undefined) updateData.lastEducation = lastEducation || null;
  if (religion !== undefined) updateData.religion = religion || null;
  if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (address !== undefined) updateData.address = address || null;
  if (joinDate !== undefined) updateData.joinDate = joinDate ? new Date(joinDate) : null;

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return findUserProfileById(id);
}

export async function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}
