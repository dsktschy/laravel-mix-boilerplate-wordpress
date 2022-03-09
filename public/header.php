<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<link href="<?= mix( '/assets/styles/index.css' ) ?>" rel="stylesheet" />
	<link href="<?= mix( '/favicon.ico' ) ?>" rel="icon" />
	<title><?php wp_title( ' | ', true, 'right' ); bloginfo( 'name' ); ?></title>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	<?php echo file_get_contents( get_stylesheet_directory() . '/assets/sprites/index.svg' ); ?>
