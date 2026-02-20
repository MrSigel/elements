import ViewerRequestsClient from "./RequestsClient";

export default async function ViewerRequestsPage({ params }: { params: Promise<{ viewerToken: string }> }) {
  const { viewerToken } = await params;
  return <ViewerRequestsClient viewerToken={viewerToken} />;
}
