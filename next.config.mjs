/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      // Two routes are embedded as iframes on the WordPress site: the quiz on
      // /career-quiz/ (replacing the old Typeform) and the story form on
      // /about/. Everything else stays unframeable.
      ...["/quiz/embed", "/share-your-story/embed"].map((source) => ({
        source,
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://slptransitions.com https://www.slptransitions.com;",
          },
        ],
      })),
    ];
  },
};

export default nextConfig;
