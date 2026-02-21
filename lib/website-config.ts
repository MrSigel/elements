import { promises as fs } from "fs";
import path from "path";

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
  navBrand: "Elements",
  deals: [],
  giveaways: []
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "website-configs.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}), "utf8");
  }
}

async function readAll(): Promise<Record<string, WebsiteConfig>> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Record<string, WebsiteConfig>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, WebsiteConfig>) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getWebsiteConfig(slug: string): Promise<WebsiteConfig> {
  const all = await readAll();
  return all[slug] ?? DEFAULT_CONFIG;
}

export async function setWebsiteConfig(slug: string, config: WebsiteConfig) {
  const all = await readAll();
  all[slug] = config;
  await writeAll(all);
}

