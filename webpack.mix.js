const mix = require('laravel-mix')
const fs = require('fs-extra')
const multimatch = require('multimatch')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
require('laravel-mix-polyfill')
require('laravel-mix-copy-watched')
require('laravel-mix-eslint')
require('laravel-mix-stylelint')
require('laravel-mix-imagemin')

const srcRelativePath =
  (process.env.MIX_SRC_RELATIVE_PATH || 'resources')
    .replace(/\/$/, '')
const distRelativePath =
  (process.env.MIX_DIST_RELATIVE_PATH || 'public')
    .replace(/\/$/, '')

fs.removeSync(`${distRelativePath}/assets`)

mix
  .setPublicPath(distRelativePath) // *1
  .polyfill()
  .js(
    `${srcRelativePath}/assets/js/app.js`,
    `${distRelativePath}/assets/js`
  )
  .eslint()
  .sass(
    `${srcRelativePath}/assets/css/app.scss`,
    `${distRelativePath}/assets/css`
  )
  .stylelint()
  .options({ processCssUrls: false })
  .webpackConfig({
    plugins: [
      new SVGSpritemapPlugin(
        `${srcRelativePath}/assets/svg/sprite/*.svg`, // *2
        {
          output: {
            filename: 'assets/svg/sprite.svg',
            chunk: {
              name: 'assets/js/.svg-dummy-module',
              keep: true // *3
            },
            svgo: {
              plugins: [
                { addClassesToSVGElement: { className: 'svg-sprite' } }
              ]
            },
            svg4everybody: true
          }
        }
      )
    ]
  })
  .copyWatched(
    [
      `${srcRelativePath}/assets/svg/!(sprite)`,
      `${srcRelativePath}/assets/svg/!(sprite)/**/*`
    ],
    `${distRelativePath}/assets/svg`,
    { base: `${srcRelativePath}/assets/svg` }
  )
  .browserSync({
    open: false,
    host: process.env.MIX_BROWSER_SYNC_HOST || 'localhost',
    port: process.env.MIX_BROWSER_SYNC_PORT || 3000,
    proxy: process.env.MIX_BROWSER_SYNC_PROXY || false,
    files: [ // *4
      `${distRelativePath}/assets/**/*`,
      `${distRelativePath}/**/*.php`
    ],
    https:
      process.env.MIX_BROWSER_SYNC_HTTPS_CERT &&
      process.env.MIX_BROWSER_SYNC_HTTPS_KEY
        ? {
          cert: process.env.MIX_BROWSER_SYNC_HTTPS_CERT,
          key: process.env.MIX_BROWSER_SYNC_HTTPS_KEY
        }
        : false
  })
  .sourceMaps(false, 'inline-cheap-module-source-map') // *5

if (process.env.NODE_ENV === 'production') {
  mix
    .version()
    .imagemin(
      [ 'assets/images/**/*' ],
      { context: srcRelativePath },
      {
        test: filePath => !!multimatch(filePath, [ 'assets/images/**/*' ]).length, // *6
        pngquant: { strip: true, quality: 100-100 }, // 0 ~ 100
        gifsicle: { optimizationLevel: 1 }, // 1 ~ 3
        plugins: [ require('imagemin-mozjpeg')({ quality: 100 }) ] // 0 ~ 100
      }
    )
    .then(() => {
      const svgDummyModuleName = 'assets/js/.svg-dummy-module'
      fs.removeSync(`${distRelativePath}/${svgDummyModuleName}.js`) // *7
      const pathToManifest = `${distRelativePath}/mix-manifest.json`
      const manifest = require(`./${pathToManifest}`)
      delete manifest[`/${svgDummyModuleName}.js`]
      fs.writeFileSync(path.resolve(pathToManifest), JSON.stringify(manifest), 'utf-8') // *8
    })
}

else {
  mix
    .copyWatched( // *9
      `${srcRelativePath}/assets/images`,
      `${distRelativePath}/assets/images`,
      { base: `${srcRelativePath}/assets/images` }
    )
}

/*

*1
This method determines output directories for followings
`mix-manifest.json`, webpackConfig, imagemin

*2
Following setting must not be set
`${srcRelativePath}/assets/svg/sprite/** /*.svg`
Because, file name determines id attribute, so all target file names must be unique

*3
Keep chunk file without deletion
Because error occurs if chunk file has deleted when creating `mix-manifest.json`

*4
Following setting must not be set
`${distRelativePath}/** /*`
Because injection of changes such as CSS will be not available
https://github.com/JeffreyWay/laravel-mix/issues/1053

*5
Note that several types don't output map for CSS
https://webpack.js.org/configuration/devtool/#devtool

*6
`test` option is required
Because imagemin can not find targets exactly without this function

*7
Remove unnecesary chunk file for SVG sprite, after all processings

*8
Remove unnecesary line for SVG sprite in `mix-manifest.json`, after all processings

*9
In development, copyWatched method is used instead of imagemin
Because it is unnecessary to optimize images

*/
