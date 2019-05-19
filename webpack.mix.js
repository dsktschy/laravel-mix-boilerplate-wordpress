require('dotenv').config()
const mix = require('laravel-mix')
const fs = require('fs-extra')
const multimatch = require('multimatch')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
require('laravel-mix-polyfill')
require('laravel-mix-copy-watched')
require('laravel-mix-eslint')
require('laravel-mix-stylelint')
require('laravel-mix-imagemin')

const svgDummyModuleName = 'assets/js/.svg-dummy-module'

// 1. Replace following 'input-theme-name' to your theme name
// 2. Rename following directories to your theme name
//   resources/themes/input-theme-name
//   wp-content/themes/input-theme-name
const themeName = 'input-theme-name'

const resourcesThemeDirName = `resources/themes/${themeName}`
const wpContentThemeDirName = `wp-content/themes/${themeName}`

// Clean output directory
fs.removeSync(`${wpContentThemeDirName}/assets`)

mix
  // Set output directory of mix-manifest.json
  .setPublicPath(wpContentThemeDirName)
  .polyfill()
  .js(
    `${resourcesThemeDirName}/assets/js/app.js`,
    `${wpContentThemeDirName}/assets/js`
  )
  .eslint()
  .sass(
    `${resourcesThemeDirName}/assets/css/app.scss`,
    `${wpContentThemeDirName}/assets/css`
  )
  .stylelint()
  .webpackConfig({
    plugins: [
      new SVGSpritemapPlugin(
        // Subdirectories (svg/**/*.svg) are not allowed
        // Because same ID attribute is output multiple times,
        // if file names are duplicated among multiple directories
        `${resourcesThemeDirName}/assets/svg/sprite/*.svg`,
        {
          output: {
            filename: 'assets/svg/sprite.svg',
            // In development, keep chunk file without deletion
            // Because error occurs if chunk file has deleted when creating mix-manifest.json
            chunk: {
              name: svgDummyModuleName,
              keep: true
            },
            svgo: {
              plugins: [
                { removeTitle: true },
                { cleanupIDs: true },
                { removeAttrs: { attrs: '(fill|stroke|data.*)' } },
                { addClassesToSVGElement: { className: 'svg-sprite' } }
              ]
            },
            svg4everybody: true
          }
        }
      )
    ]
  })

// Only in production mode
if (process.env.NODE_ENV === "production") {
  const patterns = [ 'assets/images/**/*' ]
  mix
    .version()
    // Copy and minify images in production
    .imagemin(
      patterns,
      { context: resourcesThemeDirName },
      {
        test: filePath => !!multimatch(filePath, patterns).length,
        optipng: { optimizationLevel: 0 }, // 0 ~ 7
        gifsicle: { optimizationLevel: 1 }, // 1 ~ 3
        plugins: [ require('imagemin-mozjpeg')({ quality: 100 }) ] // 0 ~ 100
      }
    )
    // Delete chunk file for SVG sprite
    .then(() => {
      fs.removeSync(`${wpContentThemeDirName}/${svgDummyModuleName}.js`)
      const pathToManifest = `${wpContentThemeDirName}/mix-manifest.json`
      const manifest = require(`./${pathToManifest}`)
      delete manifest[`/${svgDummyModuleName}.js`]
      fs.writeFileSync(path.resolve(pathToManifest), JSON.stringify(manifest), 'utf-8')
    })
}

// Only in development mode
else {
  // Copy images without minifying in development
  mix.copyWatched(
    `${resourcesThemeDirName}/assets/images`,
    `${wpContentThemeDirName}/assets/images`,
    { base: `${resourcesThemeDirName}/assets/images` }
  )
  if (process.env.BROWSER_SYNC_PROXY) {
    // Reloading is necessary to see the change of the SVG file
    // But BrowserSync execute ingection for SVG changes
    // Options of BrowserSync can not change this behavior
    // https://github.com/BrowserSync/browser-sync/issues/1287
    const options = {
      open: false,
      host: process.env.BROWSER_SYNC_HOST || 'localhost',
      port: process.env.BROWSER_SYNC_PORT || 3000,
      proxy: process.env.BROWSER_SYNC_PROXY || '',
      // If this setting is `${wpContentThemeDirName}/**/*`,
      // injection of changes such as CSS will be not available
      // https://github.com/JeffreyWay/laravel-mix/issues/1053
      files: [
        `${wpContentThemeDirName}/assets/**/*`,
        `${wpContentThemeDirName}/**/*.php`
      ]
    }
    const cert = process.env.BROWSER_SYNC_HTTPS_CERT
    const key = process.env.BROWSER_SYNC_HTTPS_KEY
    if (cert && key) {
      options.https = { cert, key }
    }
    mix.browserSync(options)
  }
}
