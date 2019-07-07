# Laravel Mix Boilerplate for WordPress

## Usage

### At first

1. Construct WordPress in your favorite way, e.g. Docker, XAMPP, and Local by Flywheel.

2. With symbolic link, reffer `public` that contains this README.md, from `wp-content/themes/{your-theme-name}` in your WordPress.

3. From admin page of your constructed WordPress, apply theme: `{your-theme-name}` .

4. Create `.env` by copying `.env-sample` , open `.env` , and set WordPress URL to `MIX_BROWSER_SYNC_PROXY` , e.g. `http://localhost:8000` and `http://wordpress.test` .

5. Run `npm i` and `npm run dev` , you will see sample page in `http://localhost:3000` .

### Next

1. Open `public/style.css` , and edit comments.

2. Open `package.json` , and edit properties. Name, description, and more.
