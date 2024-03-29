<?php get_header(); ?>

<h1 class="heading" data-target>Laravel Mix Boilerplate WordPress</h1>

<img
	src="<?= mix( '/assets/images/logo.png' ) ?>"
	width="296"
	height="76"
	alt="Laravel Mix"
	class="image"
/>

<ul class="list">
	<li class="item">
		<button class="trigger" data-trigger>
			<svg class="icon">
				<use xlink:href="#sprite-flask"></use>
			</svg>
		</button>
	</li>
	<li class="item">
		<a
			href="https://github.com/dsktschy/laravel-mix-boilerplate-static"
			target="_blank"
			rel="noopener noreferrer"
			class="trigger"
		>
			<svg class="icon">
				<use xlink:href="#sprite-github"></use>
			</svg>
		</a>
	</li>
</ul>

<?php get_footer(); ?>
