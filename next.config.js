module.exports = {
    async headers() {
      return [
        // {
        //   source: '/events/:slug*',
        //   headers: [
        //     {
        //         key: 'Cache-Control',
        //         value: 'no-store, max-age=1',
        //     },
        //   ],
        // },      
        // { 
        //     source: '/:path*{/}?',
        //     headers: [
        //       {
        //         key: 'Cache-Control',
        //         value: 'no-store, max-age=1',
        //       },
        //     ],
        //   },
        ]
    }
}