module.exports = {
  open: false,
  host: process.env.MIX_BROWSER_SYNC_HOST || 'localhost',
  port: process.env.MIX_BROWSER_SYNC_PORT || 3000,
  proxy: process.env.MIX_BROWSER_SYNC_PROXY || false,
  files: [`${process.env.MIX_DIST_RELATIVE_PATH}/**/!(mix-manifest.json)`],
  https:
    process.env.MIX_BROWSER_SYNC_HTTPS_CERT &&
    process.env.MIX_BROWSER_SYNC_HTTPS_KEY
      ? {
          cert: process.env.MIX_BROWSER_SYNC_HTTPS_CERT,
          key: process.env.MIX_BROWSER_SYNC_HTTPS_KEY
        }
      : false,
  // true: SVG changes will trigger reloading, but CSS changes will do too
  // false: CSS changes will be injected without reloading, but SVG changes will not trigger reloading
  injectChanges: false
}
