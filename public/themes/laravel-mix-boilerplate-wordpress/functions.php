<?php
/**
 * Get file path from mix-manifest.json for cache busting
 * Original implementation is in Laravel
 * https://github.com/laravel/framework/blob/master/src/Illuminate/Foundation/Mix.php
 *
 * @param string $filePath
 */
function mix( $filePath = '' ) {
	static $manifest = null;
	$prefix = get_stylesheet_directory_uri();
	if ( is_null( $manifest ) ) {
		$manifestPath = get_stylesheet_directory() . '/mix-manifest.json';
		if ( !is_file( $manifestPath ) ) return $prefix . $filePath;
		$manifest = json_decode( file_get_contents( $manifestPath ), true );
	}
	if ( !isset( $manifest[ $filePath ] ) ) return $prefix . $filePath;
	return $prefix . $manifest[ $filePath ];
}
