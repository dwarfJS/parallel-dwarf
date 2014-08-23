var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , jsLint = require('gulp-jslint');

gulp.task('default', function () {
  gulp.src('src/loader-indexedDB.js')
    .pipe(uglify({
      evaluate: false
    }))
    .pipe(gulp.dest('dest'));
})