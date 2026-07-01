import { PrismaClient, Role, DocumentArchiveCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting compact database seeding...");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const staffPassword = process.env.SEED_STAFF_PASSWORD || "Staff123!";
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD || "Pegawai123!";

  // =========================================================================
  // 1. MASTER STATUS KEPEGAWAIAN (2 Items)
  // =========================================================================
  const statusNames = ["ASN", "Non ASN"];

  const statusMap = new Map<string, any>();
  for (const name of statusNames) {
    const s = await prisma.employmentStatus.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    statusMap.set(name, s);
  }
  console.log(`✅ Seeded ${statusNames.length} Employment Statuses`);

  // =========================================================================
  // 2. MASTER JENIS KEPEGAWAIAN / GROUPS (4 Items)
  // =========================================================================
  const asnId = statusMap.get("ASN").id;
  const nonAsnId = statusMap.get("Non ASN").id;

  const groupDefinitions = [
    { name: "PNS", statusId: asnId },
    { name: "PPPK", statusId: asnId },
    { name: "BLUD Tetap", statusId: nonAsnId },
    { name: "BLUD Kontrak", statusId: nonAsnId },
  ];

  const groupMap = new Map<string, any>();
  for (const def of groupDefinitions) {
    const g = await prisma.employeeGroup.upsert({
      where: {
        name_employmentStatusId: {
          name: def.name,
          employmentStatusId: def.statusId,
        },
      },
      update: {},
      create: {
        name: def.name,
        employmentStatusId: def.statusId,
      },
    });
    groupMap.set(def.name, g);
  }
  console.log(`✅ Seeded ${groupDefinitions.length} Employee Groups`);

  // =========================================================================
  // 3. MASTER KELOMPOK PROFESI (5 Items)
  // =========================================================================
  const professionNames = [
    "Medis & Dokter Spesialis",
    "Keperawatan",
    "Kebidanan",
    "Administrasi & Manajemen",
    "Teknologi Informasi (IT)",
  ];

  const profMap = new Map<string, any>();
  for (const name of professionNames) {
    const p = await prisma.professionGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    profMap.set(name, p);
  }
  console.log(`✅ Seeded ${professionNames.length} Profession Groups`);

  // =========================================================================
  // 4. MASTER JABATAN (5 Items)
  // =========================================================================
  const positionDefinitions = [
    { name: "Dokter Umum Pelaksana", profId: profMap.get("Medis & Dokter Spesialis").id },
    { name: "Perawat Ners Kepala Ruangan", profId: profMap.get("Keperawatan").id },
    { name: "Bidan Koordinator Kebidanan", profId: profMap.get("Kebidanan").id },
    { name: "Staf Administrasi", profId: profMap.get("Administrasi & Manajemen").id },
    { name: "Pranata Komputer / Software Engineer", profId: profMap.get("Teknologi Informasi (IT)").id },
  ];

  const posMap = new Map<string, any>();
  for (const def of positionDefinitions) {
    const pos = await prisma.employeePosition.upsert({
      where: {
        name_professionGroupId: {
          name: def.name,
          professionGroupId: def.profId,
        },
      },
      update: {},
      create: {
        name: def.name,
        professionGroupId: def.profId,
      },
    });
    posMap.set(def.name, pos);
  }
  console.log(`✅ Seeded ${positionDefinitions.length} Employee Positions`);

  // =========================================================================
  // 5. MASTER PANGKAT & GOLONGAN (5 Items)
  // =========================================================================
  const rankNames = [
    "Pembina (IV/a)",
    "Penata Tingkat I (III/d)",
    "Penata (III/c)",
    "Penata Muda Tingkat I (III/b)",
    "Pengatur Tingkat I (II/d)",
  ];

  const rankMap = new Map<string, any>();
  for (const name of rankNames) {
    const r = await prisma.employeeRank.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    rankMap.set(name, r);
  }
  console.log(`✅ Seeded ${rankNames.length} Employee Ranks`);

  // =========================================================================
  // 6. MASTER TEMPAT / UNIT TUGAS (5 Items)
  // =========================================================================
  const workplaceNames = [
    "RSUD Bahteramas - Sekretariat & Direksi",
    "Instalasi Gawat Darurat (IGD 24 Jam)",
    "Intensive Care Unit (ICU / ICCU)",
    "Poliklinik Rawat Jalan Terpadu",
    "Unit Sistem Informasi Manajemen (SIMRS / IT)",
  ];

  const workplaceMap = new Map<string, any>();
  for (const name of workplaceNames) {
    const w = await prisma.workplace.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    workplaceMap.set(name, w);
  }
  console.log(`✅ Seeded ${workplaceNames.length} Workplaces`);

  // =========================================================================
  // 7. SEED USERS (EXACTLY 5 USERS: 2 ADMIN, 1 STAFF, 2 EMPLOYEE)
  // =========================================================================
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const staffHash = await bcrypt.hash(staffPassword, 10);
  const employeeHash = await bcrypt.hash(employeePassword, 10);

  const adminDefs = [
    { name: "Administrator Utama", email: "admin@smdp.local", nip: "199001012020011001", nik: "7471010101900001" },
    { name: "Hendra Wijaya, S.T.", email: "admin.hendra@smdp.local", nip: "198504122012011002", nik: "7471011204850002" },
  ];

  const staffDefs = [
    { name: "Siti Rahmawati, S.Kom", email: "verifikator@smdp.local", nip: "198805122018022002", nik: "7471011205880011" },
  ];

  const employeeDefs = [
    {
      name: "dr. Budi Santoso, Sp.B",
      email: "budi.santoso@smdp.local",
      nip: "198203152010011003",
      nik: "7471011503820021",
      gender: "L",
      degree: "Sp.B",
      edu: "S2",
      rel: "Islam",
      marital: "Kawin",
      phone: "081234567890",
      addr: "Jl. Ahmad Yani No. 45, Kendari",
      status: "ASN",
      group: "PNS",
      prof: "Medis & Dokter Spesialis",
      pos: "Dokter Umum Pelaksana",
      rank: "Pembina (IV/a)",
      work: "Poliklinik Rawat Jalan Terpadu",
    },
    {
      name: "Dewi Lestari, S.Kep., Ns.",
      email: "dewi.lestari@smdp.local",
      nip: "199508202022032004",
      nik: "7471022008950022",
      gender: "P",
      degree: "S.Kep., Ns.",
      edu: "D4/S1",
      rel: "Islam",
      marital: "Kawin",
      phone: "082198765432",
      addr: "Jl. Lepo-Lepo Indah Blk. B/12",
      status: "ASN",
      group: "PPPK",
      prof: "Keperawatan",
      pos: "Perawat Ners Kepala Ruangan",
      rank: "Penata (III/c)",
      work: "Intensive Care Unit (ICU / ICCU)",
    },
  ];

  const allowedEmails = [
    ...adminDefs.map((a) => a.email),
    ...staffDefs.map((s) => s.email),
    ...employeeDefs.map((e) => e.email),
  ];

  // Clean up any excess users not in allowed list
  await prisma.user.deleteMany({
    where: {
      email: { notIn: allowedEmails },
    },
  });

  // 7A. SEED 2 ADMIN USERS
  for (const a of adminDefs) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {
        passwordHash: adminHash,
        nik: a.nik,
        employmentStatusId: asnId,
        employeeGroupId: groupMap.get("PNS").id,
        professionGroupId: profMap.get("Teknologi Informasi (IT)").id,
        employeePositionId: posMap.get("Pranata Komputer / Software Engineer").id,
        employeeRankId: rankMap.get("Penata (III/c)").id,
        workplaceId: workplaceMap.get("Unit Sistem Informasi Manajemen (SIMRS / IT)").id,
      },
      create: {
        employeeId: a.nip,
        nik: a.nik,
        email: a.email,
        passwordHash: adminHash,
        name: a.name,
        role: Role.ADMIN,
        gender: "L",
        employmentStatusId: asnId,
        employeeGroupId: groupMap.get("PNS").id,
        professionGroupId: profMap.get("Teknologi Informasi (IT)").id,
        employeePositionId: posMap.get("Pranata Komputer / Software Engineer").id,
        employeeRankId: rankMap.get("Penata (III/c)").id,
        workplaceId: workplaceMap.get("Unit Sistem Informasi Manajemen (SIMRS / IT)").id,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: Role.ADMIN } },
      update: {},
      create: { userId: user.id, role: Role.ADMIN },
    });
  }

  // 7B. SEED 1 STAFF USER
  for (const s of staffDefs) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        passwordHash: staffHash,
        nik: s.nik,
        employmentStatusId: asnId,
        employeeGroupId: groupMap.get("PNS").id,
        professionGroupId: profMap.get("Administrasi & Manajemen").id,
        employeePositionId: posMap.get("Staf Administrasi").id,
        employeeRankId: rankMap.get("Penata Muda Tingkat I (III/b)").id,
        workplaceId: workplaceMap.get("RSUD Bahteramas - Sekretariat & Direksi").id,
      },
      create: {
        employeeId: s.nip,
        nik: s.nik,
        email: s.email,
        passwordHash: staffHash,
        name: s.name,
        role: Role.STAFF,
        gender: "P",
        employmentStatusId: asnId,
        employeeGroupId: groupMap.get("PNS").id,
        professionGroupId: profMap.get("Administrasi & Manajemen").id,
        employeePositionId: posMap.get("Staf Administrasi").id,
        employeeRankId: rankMap.get("Penata Muda Tingkat I (III/b)").id,
        workplaceId: workplaceMap.get("RSUD Bahteramas - Sekretariat & Direksi").id,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: Role.STAFF } },
      update: {},
      create: { userId: user.id, role: Role.STAFF },
    });
  }

  // 7C. SEED 2 EMPLOYEE USERS
  for (const e of employeeDefs) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {
        passwordHash: employeeHash,
        nik: e.nik,
        academicDegree: e.degree,
        lastEducation: e.edu,
        religion: e.rel,
        maritalStatus: e.marital,
        phone: e.phone,
        address: e.addr,
        employmentStatusId: statusMap.get(e.status)?.id || asnId,
        employeeGroupId: groupMap.get(e.group)?.id || groupMap.get("PNS").id,
        professionGroupId: profMap.get(e.prof)?.id || profMap.get("Medis & Dokter Spesialis").id,
        employeePositionId: posMap.get(e.pos)?.id || posMap.get("Dokter Umum Pelaksana").id,
        employeeRankId: rankMap.get(e.rank)?.id || rankMap.get("Penata (III/c)").id,
        workplaceId: workplaceMap.get(e.work)?.id || workplaceMap.get("Instalasi Gawat Darurat (IGD 24 Jam)").id,
      },
      create: {
        employeeId: e.nip,
        nik: e.nik,
        email: e.email,
        passwordHash: employeeHash,
        name: e.name,
        role: Role.EMPLOYEE,
        gender: e.gender,
        academicDegree: e.degree,
        lastEducation: e.edu,
        religion: e.rel,
        maritalStatus: e.marital,
        phone: e.phone,
        address: e.addr,
        employmentStatusId: statusMap.get(e.status)?.id || asnId,
        employeeGroupId: groupMap.get(e.group)?.id || groupMap.get("PNS").id,
        professionGroupId: profMap.get(e.prof)?.id || profMap.get("Medis & Dokter Spesialis").id,
        employeePositionId: posMap.get(e.pos)?.id || posMap.get("Dokter Umum Pelaksana").id,
        employeeRankId: rankMap.get(e.rank)?.id || rankMap.get("Penata (III/c)").id,
        workplaceId: workplaceMap.get(e.work)?.id || workplaceMap.get("Instalasi Gawat Darurat (IGD 24 Jam)").id,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: Role.EMPLOYEE } },
      update: {},
      create: { userId: user.id, role: Role.EMPLOYEE },
    });
  }

  console.log(`✅ Seeded ${allowedEmails.length} Total Users (2 ADMIN, 1 STAFF, 2 EMPLOYEE)`);

  // =========================================================================
  // 8. MASTER TIPE DOKUMEN
  // =========================================================================
  // Jangan hapus DocumentType di seed. DocumentRecord memiliki foreign key ke
  // DocumentType, sehingga menghapus master dokumen bisa merusak data upload
  // yang sudah ada di Supabase/production.
  console.log("✅ Skipped Document Types seeding (managed by ADMIN in app)");

  // =========================================================================
  // 9. MASTER SYSTEM SETTINGS
  // =========================================================================
  await prisma.systemSetting.upsert({
    where: { key: "MAX_AVATAR_UPLOAD_SIZE_KB" },
    update: {},
    create: {
      key: "MAX_AVATAR_UPLOAD_SIZE_KB",
      value: "200",
      label: "Maksimal Ukuran Foto Profil (KB)",
      description: "Ukuran maksimal file foto profil pengguna dalam satuan Kilobyte (KB)",
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "SECURITY_LOG_RETENTION_DAYS" },
    update: {},
    create: {
      key: "SECURITY_LOG_RETENTION_DAYS",
      value: "30",
      label: "Masa Simpan Security Logs (Hari)",
      description: "Jumlah hari penyimpanan rekam aktivitas audit sebelum dihapus otomatis",
    },
  });

  console.log("✅ Seeded System Settings");
  console.log("🎉 Compact seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
