// Intro to Gulp - Gulpfile - ver 1.0.0
// Created by: Michael Whyte

// This Gulpfile is modified from code found here:
// https://github.com/thecodercoder/frontend-boilerplate

// Initialize modules
// Import gulp specific API functions which allows us to write them 
// below as [gulp-function-name] instead gulp.[function-name],
// for example:
// src() instead of gulp.src()
const { src, dest, watch, series, parallel } = require('gulp');
// Import Gulp plugins and npm packages that we need for this project


const sourcemaps   = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const browserSync  = require('browser-sync').create();
const imageMin     = require('gulp-imagemin');
const cache        = require('gulp-cache');
const htmlMin      = require('gulp-htmlmin');
const del          = require('del');

// Folders
const folders = {};
folders.dev     = 'dev';
folders.dist    = 'dist';
folders.sass    = 'scss';
folders.styles  = 'styles';
folders.scripts = 'scripts';
folders.images  = 'images';
folders.fonts   = 'fonts';

// Files
files = {};
files.html    = `**/*.html`;
files.sass    = `${folders.sass}/**/*.scss`;
files.css    = `${folders.styles}/**/*.css`;
files.js      = `${folders.scripts}/**/*.js`;
files.images  = `${folders.images}/**/*.+(png|jpg|gif|svg)`;
files.fonts   = `${folders.fonts}/**/*`;


// Sass Task: 
// 1. Compiles the Sass files into the dev styles folder
// 2. Injects CSS into the browser 
function sassTask(){    
    return src(`${folders.dev}/${files.sass}`)
      .pipe(sourcemaps.init()) // Initializes sourcemaps (dev mode) 
      .pipe(sass().on('error', sass.logError)) // compiles SCSS to CSS
      .pipe(sourcemaps.write('.')) // writes sourcemaps file (dev mode)
      .pipe(dest(`${folders.dev}/${folders.styles}`)) // Puts CSS files in dev styles folder (dev mode)
      .pipe(browserSync.stream()) // Injects new CSS to the browser (dev mode)
}

// CSS Task:
// 1. Copies all the CSS files from the dev styles folder to the dist styles folder
function cssTask(){
  return src(`${folders.dev}/${files.css}`)
      .pipe(dest(`${folders.dist}/${folders.styles}`));
}

// // JS Task
// // 1. Copies all the JS files from the dev scripts folder to the dist script folder
function jsTask(){
    return src(`${folders.dev}/${files.js}`)
        .pipe(dest(`${folders.dist}/${folders.scripts}`));
}

// Images Task:
// 1. Compresses the image files
// 2. Copies the compressed image files to the dist images folder
function imagesTask(){
    return src(`${folders.dev}/${files.images}`)
        .pipe(cache(imageMin({interlaced: true}))) // Compresses images
        .pipe(dest(`${folders.dist}/${folders.images}`)); // Copies compressed images to the dist images folder
}

// Fonts Task:
// 1. Copies the font files to the dist fonts folder
function fontsTask(){
    return src(`${folders.dev}/${files.fonts}`)
      .pipe(dest(`${folders.dist}/${folders.fonts}`)); // Copies the font files to the dist fonts folder
}

// HTML Task:
// 1. Compresses the HTML files
// 2. Copies the compressed HTML files to the dist folder 
function htmlTask(){
    return src(`${folders.dev}/${files.html}`)
      .pipe(htmlMin({collapseWhitespace: true})) // Compresses the HTML files
      .pipe(dest(folders.dist)); // Copies compressed HTML files to the dist folder
}

// Watch task: 
// 1. Watch for changes in the dev Sass directory, if a change is detected then it runs the Sass task
// 2. Watch for changes in the dev JS directory, if a change is detected then it runs the JS task
// 3. Watch for changes in the HTML files in the dev directory, if a change is deteched then it re-loads the browser 
function watchTask(){
    // Setup Browsersync for automatic reloading and re-freshing of CSS, JavaScript and HTML
    browserSync.init({
      server: {
        baseDir: folders.dev
      }
    });
    watch(`${folders.dev}/${files.sass}`, sassTask); // Watches the dev Sass directory (SCSS files only)
    watch(`${folders.dev}/${files.js}`).on('change', browserSync.reload); // Watches the dev JavaScript directory (JS files only)
    watch(`${folders.dev}/${files.html}`).on('change', browserSync.reload); // Watches the dev folder (HTML files only)    
}

// Clean Task: 
// 1. Deletes all folders and files in the dist folder
function cleanTask(done){
    del.sync(folders.dist);
    done();
}

// Default Task:
// 1. Runs the following tasks in the following order:
//    a. sassTask, jsTask (in parallel)
//    b. cacheBustTask
//    c. watchTask
exports.default = series(parallel(sassTask, jsTask), watchTask);

// Build Task:
// 1. Runs the following tasks in the following order:
//    a. cleanTask
//    b. sassTask, jsTask, htmlTask, imagesTask, fontsTask (in parallel)    
exports.build = series(cleanTask, sassTask, cssTask, parallel(htmlTask, jsTask, imagesTask, fontsTask));
