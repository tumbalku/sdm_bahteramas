import { Metadata } from "next";
import { ProfileView } from "@/modules/profile/components/ProfileView";

export const metadata: Metadata = {
  title: "Profil Saya | SMDP Portal",
  description: "Kelola profil dan keamanan akun Anda",
};

export default function ProfilePage() {
  return (
    <div className="page-container">
      <ProfileView />
    </div>
  );
}
