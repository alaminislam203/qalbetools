/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // এটি আপনার সব API রাউটের জন্য CORS পারমিশন দেবে
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // আপনি চাইলে "*" এর বদলে "https://qalbetalks.com" দিতে পারেন সিকিউরিটির জন্য
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

module.exports = nextConfig;
