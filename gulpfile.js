var gulp = require('gulp'),
    rjs = require('gulp-requirejs'),
    license = require('gulp-license'),
    uglify = require('gulp-uglify'),
    organization = "Nicolas Font http://jogajs.com";

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
    .pipe(license('MIT', {tiny: true, organization: organization}))
    .pipe(gulp.dest('./'));
    
    rjs({
        baseUrl: 'src/',
        name: 'joga',
        include: ['joga'],
        wrap: true,
        out: 'joga.js'
    })
    .pipe(license('MIT', {organization: organization}))
    .pipe(gulp.dest('./'));
});
