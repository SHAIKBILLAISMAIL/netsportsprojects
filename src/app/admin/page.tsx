import { HeaderNavigation } from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <AdminDashboard />
      <Footer />
    </div>
  );
}