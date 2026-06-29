"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  ShieldAlert,
  ArrowRight,
  LogIn,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Manajemen Berkas Fleksibel",
      description:
        "Unggah dan kelola berbagai format dokumen kepegawaian (KTP, STR, SIP) dengan konfigurasi ukuran dan format yang fleksibel.",
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      title: "Verifikasi Cepat & Akurat",
      description:
        "Sistem tinjauan interaktif bagi tim verifikator untuk menyetujui atau menolak dokumen pegawai dengan mudah dan cepat.",
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-amber-500" />,
      title: "Pemantauan Kedaluwarsa",
      description:
        "Sistem otomatis mendeteksi dan memberikan peringatan untuk dokumen profesi (seperti STR/SIP) yang mendekati masa habis berlaku.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-rose-500" />,
      title: "Kalender Agenda Terpadu",
      description:
        "Pantau hari libur nasional dan cuti bersama dalam kalender interaktif yang terintegrasi dengan jadwal kepegawaian.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Manajemen Pengguna Cerdas",
      description:
        "Atur akses berbasis peran (Admin, Staff, Pegawai) dan dukung impor massal data pegawai melalui file CSV.",
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
      title: "Audit & Log Keamanan",
      description:
        "Jejak rekam aktivitas administratif yang lengkap untuk memastikan keamanan data dan transparansi operasional.",
    },
  ];

  const faqs = [
    {
      question: "Siapa saja yang bisa menggunakan sistem ini?",
      answer:
        "Sistem ini dirancang untuk seluruh pegawai internal (medis, keperawatan, administrasi) serta tim HR / Verifikator untuk memfasilitasi kelengkapan dokumen kepegawaian.",
    },
    {
      question: "Format dokumen apa saja yang didukung?",
      answer:
        "Mendukung berbagai format umum seperti PDF, JPG, PNG, DOCX, dan XLSX sesuai konfigurasi master jenis dokumen yang ditetapkan oleh admin.",
    },
    {
      question: "Apakah sistem ini memberitahu jika dokumen saya akan kedaluwarsa?",
      answer:
        "Ya, sistem secara proaktif melacak tanggal kedaluwarsa (misalnya STR dan SIP) dan memberikan indikator visual agar Anda dapat memperbaruinya tepat waktu.",
    },
    {
      question: "Bagaimana cara melakukan verifikasi dokumen?",
      answer:
        "Staff Verifikator dan Admin dapat mengakses menu Verifikasi untuk meninjau berkas yang diunggah pegawai dan memberikan rincian catatan penolakan jika berkas tidak sesuai.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              SMDP<span className="text-primary">.</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#fitur" className="hover:text-primary transition-colors">
              Fitur
            </a>
            <a href="#statistik" className="hover:text-primary transition-colors">
              Statistik
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button className="font-bold rounded-xl shadow-md hover:shadow-lg transition-all px-6">
                <LogIn className="w-4 h-4 mr-2" />
                Masuk ke Aplikasi
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4 shadow-xl">
            <a
              href="#fitur"
              className="font-semibold text-foreground py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fitur
            </a>
            <a
              href="#statistik"
              className="font-semibold text-foreground py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Statistik
            </a>
            <a
              href="#faq"
              className="font-semibold text-foreground py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-border">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full font-bold rounded-xl">
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk ke Aplikasi
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-16 md:pt-24 md:pb-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 space-y-8 text-center lg:text-left z-10">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Sistem Manajemen Kepegawaian v1.0
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Sistem Manajemen <br className="hidden md:block" />
              Dokumen &amp; <span className="text-primary">Kepatuhan</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Platform cerdas untuk mengelola berkas kepegawaian, memverifikasi sertifikat, memantau masa berlaku STR/SIP, dan menjaga kepatuhan administratif dalam satu dasbor terintegrasi.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all group"
                >
                  Masuk ke Aplikasi
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#fitur" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-xl border-2 hover:bg-muted transition-all"
                >
                  Pelajari Fitur
                </Button>
              </a>
            </div>
          </div>

          <div className="flex-1 w-full relative max-w-2xl lg:max-w-none">
            {/* Decorative background blur */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-primary to-primary/60 opacity-20 blur-2xl dark:opacity-30"></div>

            <div className="relative rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl bg-card p-2 md:p-4 transform hover:scale-[1.02] transition-transform duration-500 ease-out">
              <div className="rounded-xl overflow-hidden border border-border/30 bg-muted/30">
                <img
                  src="/bg-landing.png"
                  alt="SMDP Dashboard Preview"
                  className="w-full h-auto object-cover object-top aspect-[4/3] sm:aspect-video rounded-lg shadow-inner"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="statistik" className="w-full border-y border-border/50 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
              <div className="text-center px-4">
                <h3 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">99%</h3>
                <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Tingkat Kepatuhan
                </p>
              </div>
              <div className="text-center px-4">
                <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">&lt; 5m</h3>
                <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Waktu Verifikasi
                </p>
              </div>
              <div className="text-center px-4">
                <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">100%</h3>
                <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Digitalisasi
                </p>
              </div>
              <div className="text-center px-4">
                <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">24/7</h3>
                <p className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Akses Sistem
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Solusi Menyeluruh untuk SDM
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Sistem kami dibangun untuk menyederhanakan birokrasi, meningkatkan transparansi, dan memastikan tidak ada dokumen penting yang terlewat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-border/50">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Pertanyaan Umum
            </h2>
            <p className="text-muted-foreground font-medium">
              Pelajari lebih lanjut tentang bagaimana sistem SMDP bekerja.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-border rounded-2xl overflow-hidden bg-card transition-all"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => toggleFaq(idx)}
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      openFaqIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-muted-foreground leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-4 md:px-8 py-20 md:py-32 flex justify-center">
          <div className="w-full max-w-5xl rounded-[3rem] bg-primary p-10 md:p-20 text-center relative overflow-hidden shadow-2xl text-primary-foreground">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Siap untuk memodernisasi manajemen kepegawaian Anda?
              </h2>
              <p className="opacity-90 text-lg md:text-xl font-medium">
                Tinggalkan pemberkasan manual. Akses portal SMDP sekarang juga dan rasakan kemudahannya.
              </p>

              <div className="pt-4 flex justify-center">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-8 text-lg font-bold rounded-xl text-primary hover:bg-background hover:scale-105 transition-all shadow-xl"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-foreground">
              SMDP<span className="text-primary">.</span>
            </span>
          </div>

          <div className="text-sm font-semibold text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Sistem Manajemen Dokumen Pegawai. Hak Cipta Dilindungi.
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <a href="#fitur" className="hover:text-foreground transition-colors">
              Fitur
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
