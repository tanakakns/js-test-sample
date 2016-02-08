const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const karma = require('gulp-karma');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dest/**/*');
});

// TypeScript compile
gulp.task('compile', ['clean'], function () {
  return gulp
    .src('app/**/*.ts')
    .pipe(typescript(tsConfig.compilerOptions))
    .pipe(gulp.dest('dest/app'));
});
 
gulp.task('karma', () => {
    return gulp.src([
          // ライブラリも入れる必要がある。
          // 'bower_components/angular/angular.js',
          // 'bower_components/angular-mocks/angular-mocks.js',
          'app/typescript/*.ts',
          //'test/spec/*.ts'
          'spec/*.ts'
        ])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});

gulp.task('build', ['compile']);
gulp.task('default', ['build']);