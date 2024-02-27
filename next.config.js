module.exports = {
    async headers() {
      return [
        {
          source: '/events/:slug*',
          headers: [
            {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate',
            },
          ],
        },      
        { 
            source: '/:path*{/}?',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate',
              },
            ],
          },
        ]
    }
}