import { createServiceClient } from "@/lib/supabase/server";

export type WebsiteTemplate = "dark" | "lite";

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
  template?: WebsiteTemplate;
};

const DEFAULT_CONFIG: WebsiteConfig = {
  navBrand: "Pulseframelabs",
  deals: [],
  giveaways: [],
  template: "dark"
};

export type SiteTheme = {
  pageBg: string;
  pageText: string;
  headerBg: string;
  headerBorder: string;
  navActiveText: string;
  navActiveBg: string;
  navActiveBar: string;
  navIdleText: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
  footerBrand: string;
  headingText: string;
  headingBar: string;
  mutedText: string;
  subtleText: string;
  cardBg: string;
  cardBorder: string;
  tableRowEven: string;
  tableHeaderBg: string;
  tableHeaderBorder: string;
  tableHeaderText: string;
  tableColText: string;
  emptyBorder: string;
  emptyBg: string;
  badgeBg: string;
  badgeText: string;
  codeBg: string;
  codeBorder: string;
  codeText: string;
  visitBg: string;
  visitText: string;
  liveText: string;
  liveBg: string;
  huntCta: string;
  huntCtaBorder: string;
  huntCtaText: string;
  huntCtaIcon: string;
  iconAccent: string;
};

export const DARK_THEME: SiteTheme = {
  pageBg: "#080c14",
  pageText: "#e5edf5",
  headerBg: "rgba(10,13,20,0.85)",
  headerBorder: "rgba(255,255,255,0.05)",
  navActiveText: "#f5c451",
  navActiveBg: "rgba(245,196,81,0.1)",
  navActiveBar: "#f5c451",
  navIdleText: "#94a3b8",
  footerBg: "rgba(0,0,0,0.25)",
  footerBorder: "rgba(255,255,255,0.06)",
  footerText: "rgba(255,255,255,0.25)",
  footerBrand: "#f5c451",
  headingText: "#f5c451",
  headingBar: "linear-gradient(180deg, #f5c451, #b22234)",
  mutedText: "rgba(255,255,255,0.4)",
  subtleText: "rgba(255,255,255,0.25)",
  cardBg: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(245,196,81,0.15)",
  tableRowEven: "rgba(255,255,255,0.015)",
  tableHeaderBg: "rgba(245,196,81,0.06)",
  tableHeaderBorder: "rgba(245,196,81,0.12)",
  tableHeaderText: "#f5c451",
  tableColText: "#e5edf5",
  emptyBorder: "rgba(245,196,81,0.1)",
  emptyBg: "rgba(245,196,81,0.03)",
  badgeBg: "rgba(245,196,81,0.12)",
  badgeText: "#f5c451",
  codeBg: "rgba(178,34,52,0.1)",
  codeBorder: "rgba(178,34,52,0.3)",
  codeText: "#ff8c8c",
  visitBg: "linear-gradient(135deg, #f5c451, #e8a020)",
  visitText: "#000",
  liveText: "#4ade80",
  liveBg: "rgba(34,197,94,0.12)",
  huntCta: "rgba(245,196,81,0.08)",
  huntCtaBorder: "rgba(245,196,81,0.15)",
  huntCtaText: "#f5c451",
  huntCtaIcon: "#f5c451",
  iconAccent: "#f5c451",
};

export const LITE_THEME: SiteTheme = {
  pageBg: "#f5f7fb",
  pageText: "#1e293b",
  headerBg: "rgba(255,255,255,0.97)",
  headerBorder: "#e2e8f0",
  navActiveText: "#2563eb",
  navActiveBg: "rgba(37,99,235,0.07)",
  navActiveBar: "#2563eb",
  navIdleText: "#64748b",
  footerBg: "#eef1f7",
  footerBorder: "#e2e8f0",
  footerText: "#94a3b8",
  footerBrand: "#2563eb",
  headingText: "#1e293b",
  headingBar: "linear-gradient(180deg, #2563eb, #16a34a)",
  mutedText: "#64748b",
  subtleText: "#94a3b8",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  tableRowEven: "#f8fafc",
  tableHeaderBg: "rgba(37,99,235,0.04)",
  tableHeaderBorder: "rgba(37,99,235,0.1)",
  tableHeaderText: "#2563eb",
  tableColText: "#1e293b",
  emptyBorder: "#dbeafe",
  emptyBg: "#eff6ff",
  badgeBg: "rgba(37,99,235,0.08)",
  badgeText: "#2563eb",
  codeBg: "rgba(22,163,74,0.07)",
  codeBorder: "rgba(22,163,74,0.2)",
  codeText: "#16a34a",
  visitBg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  visitText: "#fff",
  liveText: "#16a34a",
  liveBg: "rgba(22,163,74,0.1)",
  huntCta: "rgba(37,99,235,0.06)",
  huntCtaBorder: "rgba(37,99,235,0.15)",
  huntCtaText: "#2563eb",
  huntCtaIcon: "#2563eb",
  iconAccent: "#2563eb",
};

export function getTheme(template?: WebsiteTemplate): SiteTheme {
  return template === "lite" ? LITE_THEME : DARK_THEME;
}

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
    giveaways: Array.isArray(cfg.giveaways) ? cfg.giveaways : [],
    template: cfg.template === "lite" ? "lite" : "dark"
  };
}

export async function setWebsiteConfig(slug: string, config: WebsiteConfig): Promise<void> {
  const admin = createServiceClient();
  const { error } = await admin
    .from("channels")
    .update({ website_config: config })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}
