// next.config.ts
import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

const nextConfig: NextConfig = {
  // API proxy rewrites to your backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
};

// Enable HTTPS in development
const keyPath = path.join(process.cwd(), 'localhost-key.pem');
const certPath = path.join(process.cwd(), 'localhost.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  nextConfig.devServer = {
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
  };
} else {
  console.warn('HTTPS certificate files not found. Using HTTP instead.');
}

export default nextConfig;