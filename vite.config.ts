import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getLoadContext } from './load-context'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    remixCloudflareDevProxy({ getLoadContext }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      ignoredRouteFiles: ['**/.*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: [
            '.*',
            '**/*.css',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__*.*',
          ],
        })
      },
    }),
  ],
  build: {
    minify: true,
  },
})
