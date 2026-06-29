import { PrismaClient, Role, DocumentArchiveCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Employment Statuses (Status Kepegawaian)
  const asn = await prisma.employmentStatus.upsert({
    where: { name: "ASN" },
    update: {},
    create: { name: "ASN" },
  });

  const nonAsn = await prisma.employmentStatus.upsert({
    where: { name: "Non ASN" },
    update: {},
    create: { name: "Non ASN" },
  });

  console.log("✅ Seeded Employment Statuses (ASN, Non ASN)");

  // 2. Seed Employee Groups (Jenis Kepegawaian)
  const pns = await prisma.employeeGroup.upsert({
    where: {
      name_employmentStatusId: {
        name: "PNS",
        employmentStatusId: asn.id,
      },
    },
    update: {},
    create: {
      name: "PNS",
      employmentStatusId: asn.id,
    },
  });

  const pppk = await prisma.employeeGroup.upsert({
    where: {
      name_employmentStatusId: {
        name: "PPPK",
        employmentStatusId: asn.id,
      },
    },
    update: {},
    create: {
      name: "PPPK",
      employmentStatusId: asn.id,
    },
  });

  const honorer = await prisma.employeeGroup.upsert({
    where: {
      name_employmentStatusId: {
        name: "Honorer / Kontrak",
        employmentStatusId: nonAsn.id,
      },
    },
    update: {},
    create: {
      name: "Honorer / Kontrak",
      employmentStatusId: nonAsn.id,
    },
  });

  console.log("✅ Seeded Employee Groups (PNS, PPPK, Honorer)");

  // 3. Seed Profession Groups (Kelompok Profesi)
  const medis = await prisma.professionGroup.upsert({
    where: { name: "Medis" },
    update: {},
    create: { name: "Medis" },
  });

  const keperawatan = await prisma.professionGroup.upsert({
    where: { name: "Keperawatan" },
    update: {},
    create: { name: "Keperawatan" },
  });

  const administrasi = await prisma.professionGroup.upsert({
    where: { name: "Administrasi" },
    update: {},
    create: { name: "Administrasi" },
  });

  console.log("✅ Seeded Profession Groups (Medis, Keperawatan, Administrasi)");

  // 4. Seed Employee Positions (Jabatan)
  await prisma.employeePosition.upsert({
    where: {
      name_professionGroupId: {
        name: "Dokter Spesialis",
        professionGroupId: medis.id,
      },
    },
    update: {},
    create: {
      name: "Dokter Spesialis",
      professionGroupId: medis.id,
    },
  });

  await prisma.employeePosition.upsert({
    where: {
      name_professionGroupId: {
        name: "Dokter Umum",
        professionGroupId: medis.id,
      },
    },
    update: {},
    create: {
      name: "Dokter Umum",
      professionGroupId: medis.id,
    },
  });

  await prisma.employeePosition.upsert({
    where: {
      name_professionGroupId: {
        name: "Programmer / Pranata Komputer",
        professionGroupId: administrasi.id,
      },
    },
    update: {},
    create: {
      name: "Programmer / Pranata Komputer",
      professionGroupId: administrasi.id,
    },
  });

  await prisma.employeePosition.upsert({
    where: {
      name_professionGroupId: {
        name: "Staf Administrasi",
        professionGroupId: administrasi.id,
      },
    },
    update: {},
    create: {
      name: "Staf Administrasi",
      professionGroupId: administrasi.id,
    },
  });

  console.log("✅ Seeded Employee Positions (Dokter, Programmer, etc)");

  // 5. Seed Employee Ranks (Pangkat & Golongan)
  await prisma.employeeRank.upsert({
    where: { name: "Pembina (IV/a)" },
    update: {},
    create: { name: "Pembina (IV/a)" },
  });

  await prisma.employeeRank.upsert({
    where: { name: "Penata (III/c)" },
    update: {},
    create: { name: "Penata (III/c)" },
  });

  await prisma.employeeRank.upsert({
    where: { name: "Pengatur (II/c)" },
    update: {},
    create: { name: "Pengatur (II/c)" },
  });

  console.log("✅ Seeded Employee Ranks (Pembina, Penata, Pengatur)");

  // 6. Seed Workplaces (Tempat Tugas)
  await prisma.workplace.upsert({
    where: { name: "Ruang ICCU" },
    update: {},
    create: { name: "Ruang ICCU" },
  });

  await prisma.workplace.upsert({
    where: { name: "Ruang Isolasi" },
    update: {},
    create: { name: "Ruang Isolasi" },
  });

  const workplaceMain = await prisma.workplace.upsert({
    where: { name: "RSUD Bahteramas - Sekretariat" },
    update: {},
    create: { name: "RSUD Bahteramas - Sekretariat" },
  });

  console.log("✅ Seeded Workplaces (Ruang ICCU, Ruang Isolasi, Sekretariat)");

  // 7. Seed Default Admin User
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@smdp.local" },
    update: {
      employmentStatusId: asn.id,
      employeeGroupId: pns.id,
      professionGroupId: administrasi.id,
      workplaceId: workplaceMain.id,
    },
    create: {
      employeeId: "199001012020011001",
      email: "admin@smdp.local",
      passwordHash: adminPasswordHash,
      name: "Administrator Utama",
      role: Role.ADMIN,
      employmentStatusId: asn.id,
      employeeGroupId: pns.id,
      professionGroupId: administrasi.id,
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

  // 8. Seed Sample Document Types
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
        professionGroupId: medis.id,
      },
    },
    update: {},
    create: {
      documentTypeId: str.id,
      professionGroupId: medis.id,
    },
  });

  await prisma.documentTypeProfession.upsert({
    where: {
      documentTypeId_professionGroupId: {
        documentTypeId: str.id,
        professionGroupId: keperawatan.id,
      },
    },
    update: {},
    create: {
      documentTypeId: str.id,
      professionGroupId: keperawatan.id,
    },
  });

  await prisma.documentTypeProfession.upsert({
    where: {
      documentTypeId_professionGroupId: {
        documentTypeId: sip.id,
        professionGroupId: medis.id,
      },
    },
    update: {},
    create: {
      documentTypeId: sip.id,
      professionGroupId: medis.id,
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
