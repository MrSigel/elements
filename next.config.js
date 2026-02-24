/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  // Mark Node.js built-ins used by the IRC bot as external so webpack
  // doesn't try to bundle them (they're available natively on the server).
  serverExternalPackages: ["net"],
  async redirects() {
    return [
      // Browsers always request /favicon.ico regardless of <link rel="icon">.
      // Redirect to the SVG icon so we don't serve 404s.
      { source: "/favicon.ico", destination: "/icon.svg", permanent: false }
    ];
  }
};

module.exports = nextConfig;

