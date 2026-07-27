import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginRoute() {
  if (process.env.QA_ADMIN_BYPASS === "true") {
    redirect("/admin");
  }

  // Only /admin redirects based on session state (see src/app/(admin)/admin/page.tsx).
  // This page never redirects on session state so the two pages can't bounce
  // off each other in a loop — a signed-in visitor who lands here just sees
  // the form and can navigate to /admin manually or via a successful login.
  return <AdminLoginForm />;
}
