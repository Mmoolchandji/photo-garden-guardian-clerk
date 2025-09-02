// Size Limit configuration for reproducible bundle snapshots
// Run: npm run build && npx size-limit

const filePlugin = require('@size-limit/file')

module.exports = [
  {
    name: 'JS bundle',
    path: 'dist/assets/*.js',
    limit: '800 KB',
    plugins: [filePlugin],
  },
  {
    name: 'CSS bundle',
    path: 'dist/assets/*.css',
    limit: '120 KB',
    plugins: [filePlugin],
  },
]
