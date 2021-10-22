const gulp = require('gulp');
const del = require('del');
const gulpPug = require('gulp-pug');
const gulpPlumber = require('gulp-plumber');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const gulpSass = require('gulp-sass')(require('sass'));
const gulpBabel = require('gulp-babel');
const gulpUglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpCleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace');


function clean() {
    return del('dist');
}

function fonts() {
  gulp.src('src/static/fonts/**/*.*')
    .pipe(ttf2woff())
    .pipe(gulp.dest('dist/static/fonts'));
  return gulp.src('src/static/fonts/**/*.*')
    .pipe(ttf2woff2())
    .pipe(gulp.dest('dist/static/fonts'));
}

function fontscopy() {
  return gulp.src('src/static/fonts/**/*.*')
    .pipe(gulp.dest('dist/static/fonts'));
}

function copyJS() {
  return gulp.src('src/static/js/lib/*.*')
    .pipe(gulp.dest('dist/static/js/lib'));
}

function pug2html() {
    return gulp.src('src/pug/pages/*.pug')
    .pipe(gulpPlumber())
    .pipe(gulpPug({
        pretty: true //Выводит html файл не сжатым
    }))
    .pipe(gulpPlumber.stop())
    .pipe(gulp.dest('dist'));
  }
  
  function scss2css() {
    return gulp.src('src/static/styles/style.scss')
    .pipe(gulpPlumber())
    .pipe(gulpSass())
    .pipe(gulpCleanCss({
        level: 2
        }))
    .pipe(gulpAutoprefixer())
    .pipe(gulpPlumber.stop())
    .pipe(browserSync.stream())
    .pipe(gulp.dest('dist/static/css/'));
  }

  function script() {
    return gulp.src('src/static/js/main.js')
    .pipe(gulpBabel({
        presets: ['@babel/env']
    }))
    .pipe(gulpUglify())
    .pipe(browserSync.stream())
    .pipe(gulp.dest('dist/static/js/'));
  }

  function images() {
    return gulp.src([
        'src/static/images/*.{jpg,gif,png,svg}',
        '!src/static/images/sprites/*'])
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 50, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]))
    .pipe(gulp.dest('dist/static/images/'));
  }  


function svgSpriteBuild() {
    return gulp.src('src/static/images/sprites/*.svg')
    // minify svg
      .pipe(svgmin({
        js2svg: {
          pretty: true
        }
      }))
      // remove all fill, style and stroke declarations in out shapes
      .pipe(cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
      }))
      // cheerio plugin create unnecessary string '&gt;', so replace it.
      .pipe(replace('&gt;', '>'))
      // build svg sprite
      .pipe(svgSprite({
        mode: {
          symbol: {
            sprite: "../sprite.svg"
          }
        }
      }))
      .pipe(gulp.dest('dist/static/images/sprites'));
  }


  function watch() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });


    gulp.watch("src/pug/**/*.pug", pug2html);
    gulp.watch("src/static/styles/**/*.scss", scss2css);
    gulp.watch("[src/static/images/*.{jpg,gif,png,svg}, !src/static/images/sprites/*]", images);
    gulp.watch("src/static/images/sprites/*", svgSpriteBuild);
    gulp.watch("src/static/js/main.js", script);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
}
  
  exports.default = gulp.series(clean, fonts, fontscopy, copyJS, pug2html, scss2css, svgSpriteBuild, script, images, watch);