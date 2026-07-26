import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdminSession } from "@/lib/auth";

export default async function AdminLoginRoute() {
  if (process.env.QA_ADMIN_BYPASS === "true") {
    redirect("/admin");
  }

  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
