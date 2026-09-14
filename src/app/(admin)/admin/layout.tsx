import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-layout";
import { getAdminProfile } from "@/lib/admin/auth";
import { getAdminNotifications } from "@/actions/admin";

export const metadata = {
  title: "Admin · CineTrack",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminProfile();
  if (!admin) redirect("/");

  const initialNotifications = await getAdminNotifications();

  return (
    <AdminShell
      admin={{
        username: admin.username,
        fullName: admin.fullName,
        avatarUrl: admin.avatarUrl,
        email: admin.email,
      }}
      initialNotifications={initialNotifications}
    >
      {children}
    </AdminShell>
  );
}
