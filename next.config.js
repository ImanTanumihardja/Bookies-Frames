module.exports = {
    async headers() {
      return [
        {
          source: '/events/*',
          headers: [
            {
                key: 'Cache-Control',
                value: 'public, max-age=60',
            },
          ],
        },
        ]
    }
}