module.exports = {
    async headers() {
      return [
        {
          source: '/events/:slug*',
          headers: [
            {
                key: 'Cache-Control',
                value: 'no-store, max-age=60',
            },
          ],
        },      
        { 
            source: '/:path*{/}?',
            headers: [
              {
                key: 'x-custom-header',
                value: 'my custom header value for all pages',
              },
            ],
          },
        ]
    }
}