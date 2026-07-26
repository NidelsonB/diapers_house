import { seedSettings } from "@/data/seed";
import type { SiteData } from "@/types/site";

export const createAdminShellData = (): SiteData => ({
  categories: [],
  products: [],
  orders: [],
  settings: JSON.parse(JSON.stringify(seedSettings)),
});
