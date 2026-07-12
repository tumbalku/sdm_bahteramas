import puppeteer from "puppeteer";
import QRCode from "qrcode";

interface PdfTableRow {
  cells: string[];
}

interface PdfImage {
  buffer: Buffer;
  contentType: string;
}

export interface EmployeeProfilePdfInput {
  title: string;
  subtitle: string;
  generatedAt: string;
  verificationText: string;
  logo?: PdfImage;
  avatar?: PdfImage;
  badges: string[];
  identity: [string, string][];
  profileSections: {
    title: string;
    rows: [string, string][];
  }[];
  documentRows: PdfTableRow[];
}

function escapeHtml(value: unknown) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function imageToDataUri(image?: PdfImage) {
  if (!image?.buffer.length || !image.contentType.startsWith("image/")) return "";
  return `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
}

function badgeTone(value: string) {
  const normalized = value.toLowerCase();
  if (/(aktif|berlaku|valid|selesai|disetujui|approved|lengkap)/.test(normalized)) return "success";
  if (/(kadaluarsa|expired|ditolak|nonaktif|tidak berlaku|invalid)/.test(normalized)) return "danger";
  if (/(proses|pending|menunggu|diajukan)/.test(normalized)) return "warning";
  return "info";
}

function splitSubtitle(subtitle: string) {
  const [name, ...rest] = subtitle.split(" - ");
  return {
    name: name || "-",
    employeeId: rest.join(" - ") || "-",
  };
}

function renderRows(rows: [string, string][]) {
  return rows
    .map(
      ([label, value]) => `
        <article class="info-card">
          <div class="label-row">
            <span class="label-icon"></span>
            <span>${escapeHtml(label)}</span>
          </div>
          <div class="info-value">${escapeHtml(value || "-")}</div>
        </article>`
    )
    .join("");
}

function renderDocuments(rows: PdfTableRow[]) {
  const actualRows = rows.length ? rows : [{ cells: ["Belum ada dokumen pegawai yang tercatat.", "-", "-", "-"] }];
  return actualRows
    .map((row) => {
      const [name = "-", number = "-", category = "-", status = "-"] = row.cells;
      return `
        <article class="document-item">
          <div>
            <div class="document-name">${escapeHtml(name)}</div>
            <div class="document-meta">Jenis Dokumen</div>
          </div>
          <div>
            <div class="document-number">${escapeHtml(number || "-")}</div>
            <div class="document-meta">Nomor Dokumen</div>
          </div>
          <div class="document-side">
            <span class="badge badge-muted">${escapeHtml(category || "-")}</span>
            <span class="badge badge-${badgeTone(status)}">${escapeHtml(status || "-")}</span>
          </div>
        </article>`;
    })
    .join("");
}

function buildEmployeeProfileHtml(input: EmployeeProfilePdfInput, qrDataUri: string) {
  const logoDataUri = imageToDataUri(input.logo);
  const avatarDataUri = imageToDataUri(input.avatar);
  const { name, employeeId } = splitSubtitle(input.subtitle);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    :root {
      --ink: #111827;
      --muted: #64748b;
      --soft: #f8fafc;
      --panel: #ffffff;
      --line: #dbe3ef;
      --navy: #0f2742;
      --blue: #2563eb;
      --blue-soft: #eff6ff;
      --teal: #0f766e;
      --teal-soft: #ecfdf5;
      --amber: #92400e;
      --amber-soft: #fffbeb;
      --red: #991b1b;
      --red-soft: #fef2f2;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; color: var(--ink); font-family: Arial, Helvetica, sans-serif; background: white; }
    body { font-size: 10px; line-height: 1.45; }
    .page { width: 100%; }

    .doc-header {
      position: relative;
      overflow: hidden;
      min-height: 104px;
      margin-bottom: 18px;
      padding: 20px 24px;
      border-radius: 14px;
      color: white;
      background: linear-gradient(135deg, #0f2742 0%, #12385f 66%, #0f766e 100%);
      break-inside: avoid;
    }

    .doc-header::after {
      content: "";
      position: absolute;
      right: -42px;
      top: -76px;
      width: 180px;
      height: 180px;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
    }

    .brand { display: flex; align-items: center; gap: 13px; position: relative; z-index: 1; }
    .brand-mark {
      width: 45px;
      height: 45px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: white;
      color: var(--teal);
      font-size: 22px;
      font-weight: 800;
      overflow: hidden;
    }
    .brand-mark img { width: 100%; height: 100%; object-fit: contain; padding: 5px; }
    .brand-title { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0; }
    .brand-subtitle { margin-top: 3px; color: #dbeafe; font-size: 8.5px; }
    .doc-kicker {
      position: absolute;
      right: 24px;
      top: 24px;
      z-index: 1;
      text-align: right;
      color: #bfdbfe;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .doc-kicker strong { display: block; margin-bottom: 3px; color: white; font-size: 12px; }

    .hero {
      display: grid;
      grid-template-columns: 104px 1fr;
      gap: 22px;
      align-items: center;
      margin-bottom: 18px;
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 0 10px 28px rgba(15, 39, 66, 0.08);
      break-inside: avoid;
    }

    .photo {
      width: 104px;
      height: 128px;
      overflow: hidden;
      display: grid;
      place-items: center;
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      background: var(--blue-soft);
      color: var(--muted);
      font-size: 9px;
      font-weight: 700;
      text-align: center;
    }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .hero-label { color: var(--teal); font-size: 8px; font-weight: 800; text-transform: uppercase; }
    .employee-name { margin: 4px 0 2px; color: var(--navy); font-size: 25px; line-height: 1.08; font-weight: 800; }
    .employee-id { color: var(--muted); font-size: 10px; }
    .hero-copy { max-width: 395px; margin: 10px 0 13px; color: #475569; font-size: 9px; }

    .badges { display: flex; flex-wrap: wrap; gap: 7px; }
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      max-width: 160px;
      padding: 4px 9px;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      color: #1d4ed8;
      background: var(--blue-soft);
      font-size: 7.5px;
      font-weight: 700;
      white-space: normal;
    }
    .badge-success { color: #166534; background: var(--teal-soft); border-color: #bbf7d0; }
    .badge-danger { color: var(--red); background: var(--red-soft); border-color: #fecaca; }
    .badge-warning { color: var(--amber); background: var(--amber-soft); border-color: #fde68a; }
    .badge-info, .badge-muted { color: #1d4ed8; background: var(--blue-soft); border-color: #bfdbfe; }
    .badge-muted { color: #475569; background: #f1f5f9; border-color: #dbe3ef; }

    .section { margin-top: 18px; break-inside: avoid; }
    .section-heading {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px;
      align-items: end;
      margin-bottom: 10px;
      break-after: avoid;
    }
    .section-number {
      color: var(--teal);
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .section-title { margin: 2px 0 0; color: var(--navy); font-size: 14px; line-height: 1.15; }
    .divider { height: 1px; margin-bottom: 4px; background: linear-gradient(90deg, var(--teal), #dbe3ef); }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .info-card {
      min-height: 54px;
      padding: 11px 12px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--panel);
      box-shadow: 0 5px 14px rgba(15, 23, 42, 0.045);
      break-inside: avoid;
    }
    .label-row {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .label-icon {
      width: 8px;
      height: 8px;
      border: 2px solid var(--teal);
      border-radius: 999px;
      background: white;
    }
    .info-value {
      margin-top: 7px;
      color: var(--ink);
      font-size: 10px;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .document-list { display: grid; gap: 8px; }
    .document-item {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.9fr) 142px;
      gap: 12px;
      align-items: center;
      padding: 11px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: white;
      break-inside: avoid;
    }
    .document-name, .document-number {
      color: var(--ink);
      font-size: 9.5px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .document-number { font-weight: 700; }
    .document-meta { margin-top: 3px; color: var(--muted); font-size: 7px; text-transform: uppercase; }
    .document-side { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }

    .print-note {
      margin-top: 12px;
      padding: 10px 12px;
      border-left: 3px solid var(--teal);
      color: #475569;
      background: #f8fafc;
      font-size: 8px;
      break-inside: avoid;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .section, .info-card, .document-item, .hero, .doc-header { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="doc-header">
      <div class="brand">
        <div class="brand-mark">${logoDataUri ? `<img src="${logoDataUri}" alt="Logo instansi" />` : "S"}</div>
        <div>
          <h1 class="brand-title">SMDP Portal</h1>
          <div class="brand-subtitle">Sistem Manajemen Dokumen Pegawai</div>
        </div>
      </div>
      <div class="doc-kicker">
        <strong>Profil Pegawai</strong>
        Dokumen Internal
      </div>
    </header>

    <section class="hero">
      <div class="photo">${avatarDataUri ? `<img src="${avatarDataUri}" alt="Foto pegawai" />` : "FOTO<br/>PEGAWAI"}</div>
      <div>
        <div class="hero-label">Preview Profil Pegawai</div>
        <h2 class="employee-name">${escapeHtml(name)}</h2>
        <div class="employee-id">NIP ${escapeHtml(employeeId)}</div>
        <p class="hero-copy">Ringkasan profil, biodata, informasi kepegawaian, dan arsip dokumen relevan untuk kebutuhan administrasi HR.</p>
        <div class="badges">
          ${input.badges.map((badge) => `<span class="badge badge-${badgeTone(badge)}">${escapeHtml(badge)}</span>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div>
          <div class="section-number">01 / Identitas</div>
          <h3 class="section-title">Identitas Utama</h3>
        </div>
        <div class="divider"></div>
      </div>
      <div class="info-grid">${renderRows(input.identity)}</div>
    </section>

    ${input.profileSections
      .map(
        (section, index) => `
        <section class="section">
          <div class="section-heading">
            <div>
              <div class="section-number">${String(index + 2).padStart(2, "0")} / Detail Profil</div>
              <h3 class="section-title">${escapeHtml(section.title)}</h3>
            </div>
            <div class="divider"></div>
          </div>
          <div class="info-grid">${renderRows(section.rows)}</div>
        </section>`
      )
      .join("")}

    <section class="section">
      <div class="section-heading">
        <div>
          <div class="section-number">04 / Dokumen</div>
          <h3 class="section-title">Arsip Kepegawaian</h3>
        </div>
        <div class="divider"></div>
      </div>
      <div class="document-list">${renderDocuments(input.documentRows)}</div>
      <div class="print-note">QR pada footer digunakan sebagai penanda verifikasi dokumen berdasarkan identitas pegawai dan waktu pembaruan profil.</div>
    </section>
  </main>
</body>
</html>`;
}

function buildFooterTemplate(input: EmployeeProfilePdfInput, qrDataUri: string) {
  return `
    <div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:7px;color:#64748b;padding:0 22mm;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #dbe3ef;padding-top:6px;">
        <span>Dicetak ${escapeHtml(input.generatedAt)}</span>
        <span style="display:flex;align-items:center;gap:8px;color:#0f2742;font-weight:700;">
          <span>Halaman <span class="pageNumber"></span> / <span class="totalPages"></span></span>
          <img src="${qrDataUri}" style="width:28px;height:28px;" />
        </span>
      </div>
    </div>`;
}

export async function buildEmployeeProfilePdf(input: EmployeeProfilePdfInput) {
  const qrDataUri = await QRCode.toDataURL(input.verificationText, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 96,
    color: { dark: "#111827", light: "#ffffff" },
  });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildEmployeeProfileHtml(input, qrDataUri), { waitUntil: "load" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: buildFooterTemplate(input, qrDataUri),
      margin: {
        top: "20mm",
        right: "22mm",
        bottom: "24mm",
        left: "22mm",
      },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
