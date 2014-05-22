var gulp = require('gulp'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
    rjs({
        baseUrl: 'src/',
        name: '../node_modules/almond/almond',
        include: ['joga'],
        wrap: true,
        insertRequire: ['joga'],
        out: 'joga.min.js'
    })
    .pipe(uglify())
    .pipe(gulp.dest('./'));
    
    rjs({
        baseUrl: 'src/',
        name: 'joga',
        include: ['joga'],
        wrap: true,
        out: 'joga.js'
    })
    .pipe(gulp.dest('./'));
});
