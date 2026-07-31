/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // The quiz is embedded as an iframe on slptransitions.com/career-quiz/,
        // replacing the old Typeform embed. Everything else stays unframeable.
        source: "/quiz/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://slptransitions.com https://www.slptransitions.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
