const fs = require('fs-extra')
const mix = require('laravel-mix')
require('laravel-mix-polyfill')
require('laravel-mix-copy-watched')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const bsConfig = require('./bs-config.js')
const svgoConfig = require('./svgo.config.js')

const srcRelativePath = process.env.MIX_SRC_RELATIVE_PATH
const publicRelativePath = process.env.MIX_PUBLIC_RELATIVE_PATH
const distRelativePath = process.env.MIX_DIST_RELATIVE_PATH

const legacyMode = process.env.MIX_LEGACY_MODE?.toLowerCase() === 'on'
const browserslistConfig = [
  'defaults',
  'iOS >= 9',
  legacyMode ? 'ie 11' : 'not ie 11'
]

const detailedSourceMapMode =
  process.env.MIX_DETAILED_SOURCE_MAP_MODE?.toLowerCase() === 'on'

// Global settings
mix
  .setPublicPath(distRelativePath)
  .version()
  .polyfill({
    targets: browserslistConfig.join(',')
  })
  .options({
    autoprefixer: {
      overrideBrowserslist: browserslistConfig
    },
    processCssUrls: false
  })
  .sourceMaps(
    false,
    detailedSourceMapMode ? 'inline-cheap-module-source-map' : 'eval'
  )
  .copyWatched(publicRelativePath, distRelativePath, {
    base: publicRelativePath
  })
  .browserSync(bsConfig)
  .before(() => {
    fs.removeSync(distRelativePath)
  })

// For themes/laravel-mix-boilerplate-wordpress
mix
  .js(
    `${srcRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/scripts/index.js`,
    `${distRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/scripts`
  )
  .sass(
    `${srcRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/styles/index.scss`,
    `${distRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/styles`
  )
  .copyWatched(
    `${srcRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/images`,
    `${distRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/images`,
    {
      base: `${srcRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/images`
    }
  )
  .webpackConfig({
    plugins: [
      new SVGSpritemapPlugin(
        `${srcRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/sprites/index/*.svg`, // *2
        {
          output: {
            svgo: svgoConfig,
            svg4everybody: legacyMode,
            filename:
              'themes/laravel-mix-boilerplate-wordpress/assets/sprites/index.svg',
            chunk: {
              name: '.svg-dummy-module',
              keep: true
            }
          }
        }
      )
    ]
  })
  .after(() => {
    if (mix.inProduction()) {
      fs.removeSync(
        `${distRelativePath}/themes/laravel-mix-boilerplate-wordpress/assets/scripts/.svg-dummy-module.js`
      )
    }
  })

// For plugins/laravel-mix-boilerplate-wordpress
mix
  .js(
    `${srcRelativePath}/plugins/laravel-mix-boilerplate-wordpress/assets/scripts/app.js`,
    `${distRelativePath}/plugins/laravel-mix-boilerplate-wordpress/assets/scripts`
  )
  .sass(
    `${srcRelativePath}/plugins/laravel-mix-boilerplate-wordpress/assets/styles/app.scss`,
    `${distRelativePath}/plugins/laravel-mix-boilerplate-wordpress/assets/styles`
  )
