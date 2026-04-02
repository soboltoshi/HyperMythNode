import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@hypermyths/config',
    '@hypermyths/core',
    '@hypermyths/protocol',
    '@hypermyths/store'
  ]
};

export default nextConfig;
