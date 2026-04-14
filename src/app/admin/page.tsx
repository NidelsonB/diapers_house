import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/admin/admin-panel";
import { getCurrentAdminSession } from "@/lib/auth";

export default async function AdminRoute() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminPanel />;
}
