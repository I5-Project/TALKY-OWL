import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.kakaocdn.net',
      },
      {
        // 카카오 OAuth 프로필 이미지 URL이 http://로 반환되는 경우가 있어 허용
        protocol: 'http',
        hostname: '*.kakaocdn.net',
      },
    ],
  },
};

export default nextConfig;
