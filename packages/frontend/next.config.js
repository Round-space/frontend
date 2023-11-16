module.exports = {
    async rewrites() {
      return [
        {
          source: '/space/:path*',
          destination: '/board/:path*',
        },
        {
          source: '/round/:path*',
          destination: '/bounty/:path*',
        },
      ];
    },
  };
  