import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.e2b.app', 'localhost', '127.0.0.1'],
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/zarinpal-guide-bargello.pdf',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/pdf',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="zarinpal-guide-bargello.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
