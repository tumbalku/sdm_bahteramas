import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/30 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">SMDP Portal</span>
        </div>
        <nav>
          <Link href="/login">
            <Button variant="outline" className="rounded-full px-6">
              Masuk
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in text-sm font-medium border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Sistem Manajemen Dokumen Pegawai Digital
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-foreground">
          Kelola Arsip Kepegawaian Secara <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Terpusat & Aman</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Tinggalkan pengelolaan berkas fisik. SMDP Portal menghadirkan solusi digitalisasi dokumen administrasi, profesi, dan sertifikasi dinas yang terstandarisasi untuk seluruh pegawai.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
              Mulai Akses Portal
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Digitalisasi Arsip</h3>
            <p className="text-muted-foreground leading-relaxed">
              Unggah dan kelola KTP, Ijazah, STR, SIP, hingga Sertifikat secara mudah dari satu dashboard terpadu.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Verifikasi & Keamanan</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sistem verifikasi berjenjang untuk menjamin keabsahan dokumen. Dilengkapi dengan audit log aktivitas.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-start text-left p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Manajemen Role</h3>
            <p className="text-muted-foreground leading-relaxed">
              Akses khusus berbasis role (RBAC) untuk Admin, Staff Verifikator, dan Pegawai guna menjaga privasi data.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} SMDP Portal. Hak Cipta Dilindungi.</p>
      </footer>
    </main>
  );
}
