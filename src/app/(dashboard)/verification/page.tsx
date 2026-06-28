import { Metadata } from "next";
import { VerificationView } from "@/modules/verification/components/VerificationView";

export const metadata: Metadata = {
  title: "Verifikasi Dokumen | SMDP Portal",
  description: "Tinjau dan validasi dokumen pegawai",
};

export default function VerificationPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <VerificationView />
    </div>
  );
}
