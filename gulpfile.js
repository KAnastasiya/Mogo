const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const plugins = require('gulp-load-plugins')();

const SRC = 'src';
const PUBLIC = './';


// Pug
gulp.task('pug', () =>
  gulp
    .src(`${SRC}/*.pug`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError()
    }))
    .pipe(plugins.pug())
    .pipe(gulp.dest(PUBLIC))
);


// Styles
gulp.task('scss', () =>
  gulp
    .src(`${SRC}/*.scss`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError()
    }))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(plugins.autoprefixer(
      ['last 2 versions', '> 1%'],
      { cascade: false }
      ))
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(PUBLIC))
);


// Scripts
gulp.task('js', () =>
  gulp
    .src(`${SRC}/*.js`)
    .pipe(plugins.plumber({
      errorHandler: plugins.notify.onError(err => ({
        title: 'Webpack',
        message: err.message
      }))
    }))
    .pipe(named())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(PUBLIC))
);


// Images
gulp.task('img', () =>
  gulp
    .src([`${SRC}/blocks/**/img/*.*`, `${SRC}/common/img/*.*`])
    .pipe(plugins.imagemin([
      imageminJpegRecompress({
        loops: 4,
        min: 40,
        max: 65,
        quality: 'medium',
        strip: true,
        progressive: true
      }),
      imageminPngquant({quality: '50-80'})
    ]))
    .pipe(gulp.dest(`${PUBLIC}/img`))
);


// Sprite
gulp.task('sprite', () =>
  gulp
    .src(`${SRC}/blocks/**/icon/*.*`)
    .pipe(plugins.svgSprites({
      cssFile: 'sprite.scss',
      preview: false,
      layout: 'horizontal',
      padding: 0,
      svg: { sprite: '../../sprite.svg' },
      templates: {
        css: require('fs').readFileSync('src/common/scss/sprite-template.scss', 'utf-8')
      }
    }))
    .pipe(gulp.dest(`${SRC}/common/scss`))
);


// Copy sprite
gulp.task('copySprite', () =>
  gulp
    .src([`${SRC}/sprite.svg`])
    .pipe(gulp.dest(PUBLIC))
);


// Copy web-components
gulp.task('copyComponents', () =>
  gulp
    .src([`${SRC}/components/**/*`])
    .pipe(gulp.dest(`${PUBLIC}/components`))
);


// Copy all
gulp.task('copy', gulp.parallel('copySprite', 'copyComponents'));


// Clean
gulp.task('cleanImg', () => del(`${PUBLIC}/img`));
gulp.task('cleanComponents', () => del(`${PUBLIC}/components`));
gulp.task('cleanSprite', () => del(`${PUBLIC}/icon`));

gulp.task('clean', gulp.parallel('cleanImg', 'cleanComponents', 'cleanSprite'));


// Server
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: PUBLIC,
      index: 'index.html'
    },
    port: 8800,
    open: false,
    reloadOnRestart: true,
    reloadDelay: 2000,
  });
});


// Watch
gulp.task('watch', () => {
  gulp.watch([
    `${SRC}/blocks/**/*.pug`,
    `${SRC}/common/pug/*.pug`,
    `${SRC}/*.pug`
  ]).on('change', gulp.series('pug', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/*.scss`,
    `${SRC}/common/scss/*.scss`,
    `${SRC}/*.scss`
  ]).on('change', gulp.series('scss', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/*.js`,
    `${SRC}/common/js.js`,
    `${SRC}/*.js`
  ]).on('change', gulp.series('js', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/img/*`,
    `${SRC}/common/img/*`
  ]).on('change', gulp.series('cleanImg', 'img', browserSync.reload));

  gulp.watch([
    `${SRC}/blocks/**/icon/*`,
    `${SRC}/common/scss/sprite-template.scss`,
  ]).on('change', gulp.series('sprite', 'cleanSprite', 'copySprite', 'scss', browserSync.reload));

  gulp.watch([
    `${SRC}/components/**/*`
  ]).on('change', gulp.series('cleanComponents', 'copyComponents', browserSync.reload));
});


// Default
gulp.task('default', gulp.series(
  gulp.parallel('clean', 'sprite'),
  gulp.parallel('img', 'pug', 'scss', 'copy'),
  gulp.parallel('server', 'watch')
));
