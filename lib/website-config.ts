import { createServiceClient } from "@/lib/supabase/server";

export type WebsiteDeal = {
  casinoName: string;
  casinoUrl: string;
  wager: string;
  bonusCode: string;
  actionAfterSignup: string;
};

export type WebsiteGiveaway = {
  title: string;
  description: string;
  endAt?: string;
};

export type WebsiteConfig = {
  navBrand: string;
  deals: WebsiteDeal[];
  giveaways: WebsiteGiveaway[];
};

const DEFAULT_CONFIG: WebsiteConfig = {
  navBrand: "Pulseframelabs",
  deals: [],
  giveaways: []
};

export async function getWebsiteConfig(slug: string): Promise<WebsiteConfig> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("channels")
    .select("website_config")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.website_config || typeof data.website_config !== "object" || Array.isArray(data.website_config)) {
    return { ...DEFAULT_CONFIG };
  }

  const cfg = data.website_config as Partial<WebsiteConfig>;
  return {
    navBrand: typeof cfg.navBrand === "string" ? cfg.navBrand : DEFAULT_CONFIG.navBrand,
    deals: Array.isArray(cfg.deals) ? cfg.deals : [],
    giveaways: Array.isArray(cfg.giveaways) ? cfg.giveaways : []
  };
}

export async function setWebsiteConfig(slug: string, config: WebsiteConfig): Promise<void> {
  const admin = createServiceClient();
  await admin
    .from("channels")
    .update({ website_config: config })
    .eq("slug", slug);
}
