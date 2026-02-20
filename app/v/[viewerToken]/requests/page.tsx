import ViewerRequestsClient from "./RequestsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ViewerRequestsPage({ params }: { params: Promise<{ viewerToken: string }> }) {
  const { viewerToken } = await params;
  return <ViewerRequestsClient viewerToken={viewerToken} />;
}
