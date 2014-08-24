var gulp = require('gulp')
  , uglify = require('gulp-uglify');

gulp.task('default', function () {
  gulp.src('src/loader-indexedDB.js')
    .pipe(uglify())
    .pipe(gulp.dest('dest'));
})