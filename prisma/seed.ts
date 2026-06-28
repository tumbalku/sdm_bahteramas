import { PrismaClient, Role, DocumentArchiveCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Employment Statuses
  const pns = await prisma.employmentStatus.upsert({
    where: { name: "PNS" },
    update: {},
    create: { name: "PNS" },
  });

  const pppk = await prisma.employmentStatus.upsert({
    where: { name: "PPPK" },
    update: {},
    create: { name: "PPPK" },
  });

  const honorer = await prisma.employmentStatus.upsert({
    where: { name: "Honorer / Non-ASN" },
    update: {},
    create: { name: "Honorer / Non-ASN" },
  });

  console.log("✅ Seeded Employment Statuses");

  // 2. Seed Employee Groups
  await prisma.employeeGroup.upsert({
    where: {
      name_employmentStatusId: {
        name: "Tenaga Kesehatan",
        employmentStatusId: pns.id,
      },
    },
    update: {},
    create: {
      name: "Tenaga Kesehatan",
      employmentStatusId: pns.id,
    },
  });

  await prisma.employeeGroup.upsert({
    where: {
      name_employmentStatusId: {
        name: "Tenaga Non-Kesehatan",
        employmentStatusId: pns.id,
      },
    },
    update: {},
    create: {
      name: "Tenaga Non-Kesehatan",
      employmentStatusId: pns.id,
    },
  });

  console.log("✅ Seeded Employee Groups");

  // 3. Seed Profession Groups
  const dokter = await prisma.professionGroup.upsert({
    where: { name: "Dokter / Medis" },
    update: {},
    create: { name: "Dokter / Medis" },
  });

  const perawat = await prisma.professionGroup.upsert({
    where: { name: "Keperawatan" },
    update: {},
    create: { name: "Keperawatan" },
  });

  const bidan = await prisma.professionGroup.upsert({
    where: { name: "Kebidanan" },
    update: {},
    create: { name: "Kebidanan" },
  });

  const adminProf = await prisma.professionGroup.upsert({
    where: { name: "Tenaga Administrasi" },
    update: {},
    create: { name: "Tenaga Administrasi" },
  });

  console.log("✅ Seeded Profession Groups");

  // 4. Seed Workplaces
  const workplaceMain = await prisma.workplace.upsert({
    where: { name: "RSUD Bahteramas" },
    update: {},
    create: { name: "RSUD Bahteramas" },
  });

  console.log("✅ Seeded Workplaces");

  // 5. Seed Default Admin User
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@smdp.local" },
    update: {},
    create: {
      employeeId: "199001012020011001",
      email: "admin@smdp.local",
      passwordHash: adminPasswordHash,
      name: "Administrator Utama",
      role: Role.ADMIN,
      professionGroupId: adminProf.id,
      workplaceId: workplaceMain.id,
    },
  });

  // Assign UserRole relation
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: adminUser.id,
        role: Role.ADMIN,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Seeded Default Admin User (admin@smdp.local / Admin123!)");

  // 6. Seed Sample Document Types
  const ktp = await prisma.documentType.upsert({
    where: { code: "KTP" },
    update: {},
    create: {
      code: "KTP",
      name: "Kartu Tanda Penduduk",
      description: "Identitas resmi kependudukan pegawai",
      archiveCategory: DocumentArchiveCategory.UTAMA,
      isMandatory: true,
      requiresExpiryDate: false,
      allowedFormats: "pdf,jpg,png",
      maxSizeMb: 2,
      icon: "FileText",
    },
  });

  const ijazah = await prisma.documentType.upsert({
    where: { code: "IJAZAH" },
    update: {},
    create: {
      code: "IJAZAH",
      name: "Ijazah Terakhir",
      description: "Dokumen bukti kelulusan pendidikan formal",
      archiveCategory: DocumentArchiveCategory.UTAMA,
      isMandatory: true,
      requiresExpiryDate: false,
      allowedFormats: "pdf",
      maxSizeMb: 5,
      icon: "FileText",
    },
  });

  const str = await prisma.documentType.upsert({
    where: { code: "STR" },
    update: {},
    create: {
      code: "STR",
      name: "Surat Tanda Registrasi (STR)",
      description: "Surat bukti tertulis registrasi tenaga kesehatan",
      archiveCategory: DocumentArchiveCategory.PROFESI,
      isMandatory: true,
      requiresExpiryDate: true,
      allowedFormats: "pdf",
      maxSizeMb: 5,
      icon: "ShieldCheck",
    },
  });

  const sip = await prisma.documentType.upsert({
    where: { code: "SIP" },
    update: {},
    create: {
      code: "SIP",
      name: "Surat Izin Praktik (SIP)",
      description: "Surat bukti tertulis izin praktik tenaga medis/kesehatan",
      archiveCategory: DocumentArchiveCategory.PROFESI,
      isMandatory: true,
      requiresExpiryDate: true,
      allowedFormats: "pdf",
      maxSizeMb: 5,
      icon: "ShieldCheck",
    },
  });

  // Link Profession specific document types
  await prisma.documentTypeProfession.upsert({
    where: {
      documentTypeId_professionGroupId: {
        documentTypeId: str.id,
        professionGroupId: dokter.id,
      },
    },
    update: {},
    create: {
      documentTypeId: str.id,
      professionGroupId: dokter.id,
    },
  });

  await prisma.documentTypeProfession.upsert({
    where: {
      documentTypeId_professionGroupId: {
        documentTypeId: str.id,
        professionGroupId: perawat.id,
      },
    },
    update: {},
    create: {
      documentTypeId: str.id,
      professionGroupId: perawat.id,
    },
  });

  await prisma.documentTypeProfession.upsert({
    where: {
      documentTypeId_professionGroupId: {
        documentTypeId: sip.id,
        professionGroupId: dokter.id,
      },
    },
    update: {},
    create: {
      documentTypeId: sip.id,
      professionGroupId: dokter.id,
    },
  });

  console.log("✅ Seeded Document Types & Profession associations");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
