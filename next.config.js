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
          source: '/api/frames/:slug*', // Matches all paths
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