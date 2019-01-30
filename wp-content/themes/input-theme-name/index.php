<?php
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Laravel Mix Boilerplate</title>
  <link
    rel="stylesheet"
    href="<?php echo get_stylesheet_directory_uri() . mix('/assets/css/app.css'); ?>"
  >
</head>
<body>
  <h1>Laravel Mix Boilerplate</h1>
  <img
    src="<?php echo get_stylesheet_directory_uri() . mix('/assets/images/app.png'); ?>"
    alt="SAMPLE"
  >
  <svg class="svg-a">
    <title>SAMPLE A</title>
    <use xlink:href="#sprite-sample-a"></use>
  </svg>
  <svg class="svg-b">
    <title>SAMPLE B</title>
    <use xlink:href="#sprite-sample-b"></use>
  </svg>
</body>
  <script src="<?php echo get_stylesheet_directory_uri() . mix('/assets/js/app.js'); ?>"></script>
</html>
