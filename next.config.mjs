/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The workbook is served from content/ by an access-gated route, so the
  // files must be traced into that function’s bundle.
  outputFileTracingIncludes: {
    "/api/course/workbook": ["./content/course/workbook/**"],
  },
  async headers() {
    return [
      // The quiz is embedded as an iframe on slptransitions.com/career-quiz/,
      // replacing the old Typeform embed. Everything else stays unframeable.
      ...["/quiz/embed"].map((source) => ({
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
