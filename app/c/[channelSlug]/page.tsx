import { redirect } from "next/navigation";

export default async function ChannelRootPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = await params;
  redirect(`/c/${channelSlug}/startseite`);
}

