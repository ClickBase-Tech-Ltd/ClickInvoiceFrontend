import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
    
    turbopack: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
      root: "/home/oseji10/Documents/MyApps/click_invoice/app",  // Path to your app's folder (where the Next.js package.json is)
    },

    output: 'export',

  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
  
};

export default nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,

//   experimental: {
//     turbo: false, // force Webpack
//   },

//   webpack(config) {
//     const fileLoaderRule = config.module.rules.find((rule) =>
//       rule.test?.test?.('.svg')
//     );

//     config.module.rules.push(
//       {
//         test: /\.svg$/i,
//         issuer: /\.[jt]sx?$/,
//         use: ['@svgr/webpack'],
//       },
//       {
//         ...fileLoaderRule,
//         test: /\.svg$/i,
//         resourceQuery: /url/,
//       }
//     );

//     if (fileLoaderRule) {
//       fileLoaderRule.exclude = /\.svg$/i;
//     }

//     return config;
//   },

//   // ❌ Remove this: output: 'export'
//   // It breaks dynamic routes without generateStaticParams()

//   // Instead use standalone:
//   output: 'export',

//   trailingSlash: true,

//   typescript: {
//     ignoreBuildErrors: true,
//   },

//   images: {
//     unoptimized: true,
//   },
// };

// module.exports = nextConfig;
