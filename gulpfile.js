var gulp = require("gulp"),
    path = require('path'),
    compass = require('gulp-compass'),
    cssmin = require('gulp-cssmin'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    typescript = require('gulp-typescript'),
    tsd = require('gulp-tsd'),
    tslint = require('gulp-tslint'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    stripDebug = require('gulp-strip-debug'),
    mainBowerFiles = require('main-bower-files'),
    del = require('del'),
    runSequence = require('run-sequence'),
    gulpif= require('gulp-if');

var SOURCE_DIR = 'src',
    DEMO_DIR = 'demo',
    DIST_DEMO = 'public',
    DIST_DIR = 'dist';

var htmlFiles = DEMO_DIR + '/html/**/*.html';
var scssFiles = DEMO_DIR + '/scss/**/*.scss';
var jsFiles = [
  DEMO_DIR + '/js/**/*.js',
  '!src/js/contrib/**/*.js',
  SOURCE_DIR + '/js/**/*.js'
];
var tsFiles = [ SOURCE_DIR + '/**/*.ts' ];

var imgFiles = DEMO_DIR + '/img/**/*.{jpg,png,gif,ico}';
var cssFiles = DEMO_DIR + '/**/*.css';

// Clean File
gulp.task('clean-workDir', function() {
    del([DIST_DEMO + '/*'], {force: true});
});

// Compass Setting
gulp.task('compass', function() {
  return gulp.src(scssFiles)
      .pipe(plumber())
      .pipe(compass({
          style: 'expanded',
          specify: DEMO_DIR + '/scss/style.scss',
          css: DEMO_DIR + '/css',
          sass: DEMO_DIR + '/scss',
          imagesDir: DEMO_DIR + '/img'
      }));
});

gulp.task('cssmin', function() {
  gulp.src(cssFiles)
    .pipe(cssmin())
    .pipe(gulp.dest(DIST_DEMO));
});

// typescript
gulp.task('typescript', ['copy-ts'], function () {
  gulp.src([
    SOURCE_DIR + '/**/*.ts',
    !SOURCE_DIR + '_all.ts'
  ])
    .pipe(plumber())
    .pipe(typescript({
      removeComments: true,
      module: 'commonjs',
      out: 'recommend.js'
    }))
    .pipe(gulp.dest(SOURCE_DIR + '/js/'));
});

// tslint
gulp.task("tslint", function() {
  gulp.src([
      "./src/**/*.ts",
      "./demo/**/*.ts"
  ])
    .pipe(tslint({
        configuration: "./tslint.json"
    }))
    .pipe(tslint.report("verbose"));
});

// bower uglify contrib
gulp.task('uglify-contrib', function () {
  gulp.src(mainBowerFiles())
    .pipe(gulpif(function(file){
      return file.path.substr(-3) === '.js';
    },
    concat('contrib.js')
    ))
    .pipe(
      gulpif(function(file) {
        return file.path.substr(-3) === '.js';
      },
      gulp.dest(WORK_DIR + '/js/')
    ));
});

/**
 * Copy Files
**/
gulp.task('copy-img', function() {
    gulp.src(imgFiles).pipe(gulp.dest(DIST_DEMO + '/img'));
});

gulp.task('copy-html', function() {
  gulp.src([
    htmlFiles,
    '!' + SOURCE_DIR + '/html/index.html'
  ]).pipe(gulp.dest(DIST_DEMO + '/html'));

  gulp.src(DEMO_DIR + '/html/index.html').pipe(gulp.dest(DIST_DEMO));
});

gulp.task('copy-ts', function() {
  return gulp.src([
    SOURCE_DIR + '/ts/' + '**/*.ts'
  ]).pipe(gulp.dest( DEMO_DIR + '/js/' ));
});

gulp.task('copy-js', function() {
  gulp.src(jsFiles).pipe(gulp.dest(DIST_DEMO + '/js'));
});

gulp.task('dist', function() {
  gulp.src(SOURCE_DIR + '/js/recommend.js')
    .pipe(gulp.dest(DIST_DIR));

  gulp.src(SOURCE_DIR + '/js/recommend.js')
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-workDir', [
  'copy-html',
  'copy-js',
  'copy-img',
  'cssmin'
]);


/**
 * Watch Files
 **/
gulp.task('watch', function() {
  // html
  gulp.watch([htmlFiles],['copy-html']);
  // compass
  gulp.watch([scssFiles],['compass']);
  // css min
  gulp.watch([cssFiles],['cssmin']);
  // javaScript
  gulp.watch([jsFiles],['copy-js']);
  // typescript
  gulp.watch([tsFiles],['build-typescript']);
  // image
  gulp.watch([imgFiles],['copy-img']);
});


// build task
gulp.task('build-ui', ['compass']);
gulp.task('build-typescript', ['copy-ts', 'typescript']);

gulp.task('tsd', function () {
  tsd({
      command: 'reinstall',
      config: './tsd.json'
  }, callback);
});

/**
 * Gulp Server
 **/
gulp.task('serve', ['connect'], function() {
  gulp.watch([
    DEMO_DIR + '/**/*.*'
  ]).on('change', function(changedFile) {
    gulp.src(changedFile.path).pipe(connect.reload());
  });
});

gulp.task('connect', function() {
  connect.server({
    root: [__dirname + '/public/'],
    port: 8088,
    livereload: true
  });
});


// default
gulp.task('default', function(callback) {
  runSequence(
    'clean-workDir',
    'build-ui',
    'build-typescript',
    'copy-workDir',
    'watch',
    'serve',
    callback
  );
});