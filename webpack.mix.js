require('dotenv').config()
const mix = require('laravel-mix')
const Log = require('laravel-mix/src/Log')
const fs = require('fs-extra')
const path = require('path')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminGifsicle = require('imagemin-gifsicle')
const globby = require('globby')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
require('laravel-mix-copy-watched')
require('laravel-mix-eslint')
require('laravel-mix-stylelint')

const svgDummyModuleName = 'assets/js/.svg-dummy-module'

// 1. Edit name and description in package.json
// 2. Edit wp-content/themes/input-theme-name/style.css
// 3. Replace 'input-theme-name' in following line to your theme name
const themeName = 'input-theme-name'
// 4. Rename following directories to same name as this variable
//   resources/themes/input-theme-name
//   wp-content/themes/input-theme-name

// Clean output directory
fs.removeSync(`wp-content/themes/${themeName}/assets`)
mix
  // Set output directory of mix-manifest.json
  .setPublicPath(`wp-content/themes/${themeName}`)
  .js(
    `resources/themes/${themeName}/assets/js/app.js`,
    `wp-content/themes/${themeName}/assets/js`
  )
  .eslint()
  .sass(
    `resources/themes/${themeName}/assets/css/app.scss`,
    `wp-content/themes/${themeName}/assets/css`
  )
  .stylelint()
  .copyWatched(
    `resources/themes/${themeName}/assets/images/**/*.{jpg,jpeg,png,gif}`,
    `wp-content/themes/${themeName}/assets/images`,
    { base: `resources/themes/${themeName}/assets/images` }
  )
  .webpackConfig({
    plugins: [
      new SVGSpritemapPlugin(
        // Subdirectories (svg/**/*.svg) are not allowed
        // Because same ID attribute is output multiple times,
        // if file names are duplicated among multiple directories
        `resources/themes/${themeName}/assets/svg/sprite/*.svg`,
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
  .version()

// Only in production mode
if (process.env.NODE_ENV === "production") {
  mix.then(async () => {
    // Execute imagemin for each file in loop
    // Because imagemin can't keep hierarchical structure
    const targets = globby.sync(
      `wp-content/themes/${themeName}/assets/images/**/*.{jpg,jpeg,png,gif}`,
      { onlyFiles: true }
    )
    for (let target of targets) {
      Log.feedback(`Optimizing ${target}`)
      await imagemin([ target ], path.dirname(target), {
        plugins: [
          imageminMozjpeg({ quality: 100 }), // 0 ~ 100
          imageminPngquant({ quality: [ 1, 1 ] }), // 0 ~ 1
          imageminGifsicle({ optimizationLevel: 3 }) // 1 ~ 3
        ]
      }).catch(error => { throw error })
    }
    // In production, delete chunk file for SVG sprite
    fs.removeSync(`wp-content/themes/${themeName}/${svgDummyModuleName}.js`)
    const pathToManifest = `wp-content/themes/${themeName}/mix-manifest.json`
    const manifest = require(`./${pathToManifest}`)
    delete manifest[`/${svgDummyModuleName}.js`]
    fs.writeFileSync(path.resolve(pathToManifest), JSON.stringify(manifest), 'utf-8')
  })
}

// Only in development mode
else {
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
      // If setting: `wp-content/themes/${themeName}/**/*`,
      // injection of changes such as CSS will be not available
      // https://github.com/JeffreyWay/laravel-mix/issues/1053
      files: [
        `wp-content/themes/${themeName}/assets/**/*`,
        `wp-content/themes/${themeName}/**/*.php`
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
