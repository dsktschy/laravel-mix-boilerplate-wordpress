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

const svgDummyModuleName = 'assets/js/.svg-dummy-module'

// Clean output directory
fs.removeSync('wp-content/themes/input-theme-name/assets')
mix
  // Set output directory of mix-manifest.json
  .setPublicPath('wp-content/themes/input-theme-name')
  .js(
    'resources/themes/input-theme-name/assets/js/app.js',
    'wp-content/themes/input-theme-name/assets/js'
  )
  .sass(
    'resources/themes/input-theme-name/assets/css/app.scss',
    'wp-content/themes/input-theme-name/assets/css'
  )
  .copyWatched(
    'resources/themes/input-theme-name/assets/images/**/*.{jpg,jpeg,png,gif}',
    'wp-content/themes/input-theme-name/assets/images',
    { base: 'resources/themes/input-theme-name/assets/images' }
  )
  .webpackConfig({
    // Prettier Loader has problem that it cause file saving one more time
    // Therefore following loaders are triggered twice
    // If this problem is not allowed,
    // you can turn off Prettier Loader by removing the following two module.rules
    // Details here: https://github.com/iamolegga/prettier-loader/issues/1
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'prettier-loader',
          exclude: /node_modules/,
          options: { parser: 'babel' }
        },
        {
          test: /\.(scss|css)?$/,
          loader: 'prettier-loader',
          exclude: /node_modules/,
          options: { parser: 'scss' }
        }
      ]
    },
    plugins: [
      new SVGSpritemapPlugin(
        // Subdirectories (svg/**/*.svg) are not allowed
        // Because same ID attribute is output multiple times,
        // if file names are duplicated among multiple directories
        'resources/themes/input-theme-name/assets/svg/sprite/*.svg',
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
      'wp-content/themes/input-theme-name/assets/images/**/*.{jpg,jpeg,png,gif}',
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
    fs.removeSync(`wp-content/themes/input-theme-name/${svgDummyModuleName}.js`)
    const pathToManifest = 'wp-content/themes/input-theme-name/mix-manifest.json'
    const manifest = require(`./${pathToManifest}`)
    delete manifest[`/${svgDummyModuleName}.js`]
    fs.writeFileSync(path.resolve(pathToManifest), JSON.stringify(manifest), 'utf-8')
  })
}

// Only in development mode
else {
  if (process.env.BROWSER_SYNC_PROXY) {
    const options = {
      open: false,
      host: process.env.BROWSER_SYNC_HOST || 'localhost',
      port: process.env.BROWSER_SYNC_PORT || 3000,
      proxy: process.env.BROWSER_SYNC_PROXY || '',
      // If setting: 'wp-content/themes/input-theme-name/**/*',
      // injection of changes such as CSS will be not available
      // https://github.com/JeffreyWay/laravel-mix/issues/1053
      // Prettier Loader has problem that it cause file saving one more time
      // Therefore reload / injection are triggered twice
      // Options of BrowserSync (e.g. reloadDebounce) can not prevent this
      // If this problem is not allowed, you can turn off Prettier Loader
      // by removing two module.rules in argument of webpackConfig method
      // https://github.com/iamolegga/prettier-loader/issues/1
      files: [
        'wp-content/themes/input-theme-name/assets/**/*',
        'wp-content/themes/input-theme-name/**/*.php'
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
