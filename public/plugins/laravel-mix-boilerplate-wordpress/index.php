<?php
/*
Plugin Name: Laravel Mix Boilerplate WordPress
Plugin URI: https://github.com/dsktschy/laravel-mix-boilerplate-wordpress
Author: dsktschy
Author URI: https://github.com/dsktschy
Description: Boilerplate for WordPress, based on Laravel Mix
Version: 0.0.0
*/

add_action( 'admin_enqueue_scripts', function() {
	$scriptPath = '/assets/scripts/app.js';
	$stylePath = '/assets/styles/app.css';
	$manifestPath = content_url() . '/mix-manifest.json';
	if ( is_file( $manifestPath ) ) {
		$manifest = json_decode( file_get_contents( $manifestPath ), true );
		if ( isset( $manifest[ $scriptPath ] ) )
			$scriptPath = $manifest[ $scriptPath ];
		if ( isset( $manifest[ $stylePath ] ) )
			$stylePath = $manifest[ $stylePath ];
	}
	$prefix = plugins_url( '', __FILE__ );

	wp_enqueue_script(
		"laravel-mix-boilerplate-wordpress-admin",
		$prefix . $scriptPath
	);
	wp_enqueue_style(
		"laravel-mix-boilerplate-wordpress-admin",
		$prefix . $stylePath
	);
} );
