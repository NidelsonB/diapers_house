import { SiteStoreProvider } from "@/providers/site-store";
import { createAdminShellData } from "@/data/admin-shell-data";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteStoreProvider
      initialData={createAdminShellData()}
      initialIsAdminAuthenticated={false}
      skipPublicBootstrap
    >
      {children}
    </SiteStoreProvider>
  );
}
