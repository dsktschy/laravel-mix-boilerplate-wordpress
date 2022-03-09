# Laravel Mix Boilerplate for WordPress

## Usage

1. Construct WordPress in your favorite way like Docker and [Local](https://localwp.com/).

2. Duplicate `.env-sample` and rename it to `.env` in this directory.

3. Edit `.env` in this directory, to set variables `MIX_BROWSER_SYNC_PROXY`. If needed, set `MIX_BROWSER_SYNC_HTTPS_KEY` and `MIX_BROWSER_SYNC_HTTPS_CERT` too.

4. Run `npm i` and `npm run build` in this directory, to output theme.

5. Link `dist` in this directory and `wp-content/themes/sitename` in your WordPress, as volume or with symlink.

6. Apply sitename theme in WordPress admin page.

7. Run `npm run dev` to develop.

8. Open `http(s)://localhost:3000` to check behavior.

9. Run `npm run build` to output production files.
