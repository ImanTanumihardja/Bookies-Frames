module.exports = {
    async headers() {
      return [
        {
          source: '/events/gsw-lal-ml*',
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