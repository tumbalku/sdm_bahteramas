import { Metadata } from "next";
import { VerificationView } from "@/modules/verification/components/VerificationView";

export const metadata: Metadata = {
  title: "Verifikasi Dokumen | SIMDP",
  description: "Tinjau dan validasi dokumen pegawai",
};

export default function VerificationPage() {
  return <VerificationView />;
}
