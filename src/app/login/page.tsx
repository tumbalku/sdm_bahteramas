import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  // Jika sudah login, redirect langsung ke dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[35%] h-[35%] rounded-full bg-secondary/30 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Halaman Utama
        </Link>

        <LoginForm />
      </div>
    </main>
  );
}
