---
pubDatetime: 2016-11-19T19:14:07Z
modDatetime: 2016-11-18T18:36:18Z
title: "Electron, JQuery & Bootstrap 3"
tags:
  - "Bootstrap"
  - "gulp"
  - "JavaScript"
  - "node.js"
  - "Web"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Well this was fun. Trying to get a project started up using Electron that includes jQuery & Bootstrap. Mashing things together so they all work required a"
---
Well this was fun. Trying to get a project started up using Electron that includes jQuery & Bootstrap. Mashing things together so they all work required a bit of jiggery-pokery using NPM, Bower and Gulp. As I wanted to get all of the components together to run a self contained desktop experience I needed local copies of Bootstrap and JQuery. Seems you can do this just by using `npm install jquery bootstrap-sass@3 jquery@1 --save-dev` and it all gets installed under the `node_modules` path. Now I'm using the bootstrap-sass package because by using Gulp I can compile the sass to css. So when I get around to making my own css I can use sass and relate it to styles/style variable already defined for Bootstrap. Taking the cue from the previous Gulp article I created a `gulpfile.js` that I could use to compile the Bootstrap sass and minify the JQuery JavaScript and add it to my HTML as a single line rather than many separate css and script files.

### gulpfile.js

``` javascript

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cleancss = require('gulp-clean-css');

// Lint Task
gulp.task('lint', function() {
return gulp.src('js/*.js')
.pipe(jshint())
.pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
return gulp.src([
'node_modules/bootstrap-sass/assets/stylesheets/*.scss',
'scss/*.scss'
])
.pipe(sass())
.pipe(cleancss())
.pipe(rename({suffix: '.min'}))
.pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
return gulp.src([
'node_modules/jquery/dist/jquery.js',
'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
'js/*.js'
])
.pipe(concat('all.js'))
.pipe(gulp.dest('dist/js'))
.pipe(rename('all.min.js'))
.pipe(uglify())
.pipe(gulp.dest('dist/js'));
});

gulp.task('bootstrap', function() {
return gulp.src([
'node_modules/bootstrap-sass/assets/fonts/**/*'
])
.pipe(gulp.dest('dist/fonts'));
});

// Watch Files For Changes
gulp.task('watch', function() {
gulp.watch('js/*.js', ['lint', 'scripts']);
gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'bootstrap']);
```

The items of note are the tasks for 'sass' and 'scripts'. I've added arrays containing the files and paths I want Gulp to process. For the 'scripts' task it grabs the jquery.js, bootstrap.js from the bower_components folders and along with any of my scripts in js/\*.js merges them into one minified file in `dist/js/all.min.js` so one simple "script" tag is all that's required:

    src="dist/js/all.min.js"

> Turns out you can't use the JQuery that ships with node. It's installs version 3.1.1 which is not supported by Bootstrap 3.3.7. So stick with JQuery 1.12.4. There is one more quirk with this setup. The Bootstrap scss file is actually named \_bootstrap.scss when it is downloaded. The sass compilation does nothing because the file begins with an underscore. So to make it work you must rename it without the underscore.

Then I came across this gem: [http://www.codingpedia.org/ama/how-to-use-gulp-to-generate-css-from-sass-scss/](http://www.codingpedia.org/ama/how-to-use-gulp-to-generate-css-from-sass-scss/) So took my sass task a step further and made it clean/minify the css. The module `gulp-minify-css` has been superceded by `gulp-clean-css`

    npm install --save-dev gulp-autoprefixer gulp-clean-css

Then edited the `gulpfile.js` to add in the plugins at the top and modify the sass script to suit.
