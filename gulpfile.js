var gulp = require('gulp');
var loadsome = require('gulp-loadsome');
var mocha  = require('gulp-mocha');

gulp.task('default', function() {
  gulp.src('test/fixtures/*.*')
        .pipe(loadsome({
        	"downloadPath":".tmp",
        	"relativePathFromDest":"../"
        }))
        .pipe(gulp.dest('./output'));
});

gulp.task('test', function() {
  return gulp
    .src('test/*.js')
    .pipe(mocha({timeout: 300000}));
});