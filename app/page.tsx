import { createServerClient } from "@/lib/supabase/server";
import { HomePageContent } from "@/components/home-page-content";
import { cookies } from "next/headers";

export default async function HomePage() {
  const client = await createServerClient();
  const { data } = await client.auth.getUser();
  const cookieStore = await cookies();
  const isTestLoggedIn = cookieStore.get("dev-test-auth")?.value === "1";
  const isLoggedIn = Boolean(data.user) || isTestLoggedIn;

  const features = [
    "Bonushunt widget with frontpages for viewers",
    "Tournament widget with frontpages",
    "Slot vs. Slot Battle",
    "Deposit / Withdrawal widget",
    "Wager Bar (current wager display)",
    "Current Playing (auto-track via extension ingest)",
    "Slot Requests with raffle",
    "Hot Words",
    "Wheel of Fortune",
    "Personal Bests",
    "Quick Guessing Bot for Bonushunt chat guesses (Twitch)",
    "Loyalty System (Store / Points)",
    "Points Battle",
    "Moderator Management (control widgets with roles)"
  ];

  const workflow = [
    { id: "01", title: "Login / Register", text: "Create your account and enter the dashboard with one entry point." },
    { id: "02", title: "Configure Overlay", text: "Build your widget setup and tune layout details to fit your stream." },
    { id: "03", title: "Go Live", text: "Publish tokens, feed OBS BrowserSource and manage interactions in realtime." }
  ];

  return (
    <HomePageContent
      isLoggedIn={isLoggedIn}
      features={features}
      workflow={workflow}
    />
  );
}

