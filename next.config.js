/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  async redirects() {
    return [
      // Browsers always request /favicon.ico regardless of <link rel="icon">.
      // Redirect to the SVG icon so we don't serve 404s.
      { source: "/favicon.ico", destination: "/icon.svg", permanent: false }
    ];
  }
};

module.exports = nextConfig;

